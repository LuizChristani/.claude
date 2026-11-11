#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', 'tests', '__tests__', '.git']);
const DEFAULT_EXPORT_ALLOWED = new Set(['App.tsx', 'App.ts']);
const HOOK_MAX_LINES = 60;
const TAILWIND_V3_CLASSES = [
  [/(?:^|[\s'"`:])(bg|text|border|divide|ring|placeholder)-opacity-\d/, '`*-opacity-*` was removed in v4; use the opacity modifier (`bg-black/50`)'],
  [/(?:^|[\s'"`:])flex-(shrink|grow)(?=[\s'"`-]|$)/, '`flex-shrink`/`flex-grow` were removed in v4; use `shrink`/`grow`'],
  [/(?:^|[\s'"`:])overflow-ellipsis(?=[\s'"`]|$)/, '`overflow-ellipsis` was removed in v4; use `text-ellipsis`'],
  [/(?:^|[\s'"`:])decoration-(slice|clone)(?=[\s'"`]|$)/, '`decoration-slice/clone` were removed in v4; use `box-decoration-slice/clone`'],
  [/(?:^|[\s'"`:])outline-none(?=[\s'"`]|$)/, '`outline-none` removes the outline in v4, also in forced-colors mode; use `outline-hidden`'],
  [/-\[--[\w-]+\]/, 'CSS variable in square brackets is v3 syntax; use parentheses (`bg-(--brand)`)'],
];

function tailwindMajor() {
  let dir = process.cwd();
  while (true) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      const version = { ...pkg.dependencies, ...pkg.devDependencies }.tailwindcss;
      if (version) return Number(/\d+/.exec(version)?.[0] ?? 0);
    } catch {}
    const parent = dirname(dir);
    if (parent === dir) return 0;
    dir = parent;
  }
}

const TAILWIND_MAJOR = tailwindMajor();

/** True when the nearest package.json up the tree depends on react-native (code runs on Hermes). */
function usesReactNative() {
  for (let dir = process.cwd(); ; dir = dirname(dir)) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      if ({ ...pkg.dependencies, ...pkg.devDependencies }['react-native']) return true;
    } catch {}
    if (dirname(dir) === dir) return false;
  }
}

const REACT_NATIVE = usesReactNative();

/** True when the nearest package.json up the tree depends on expo-router, whose route files must export default. */
function usesExpoRouter() {
  for (let dir = process.cwd(); ; dir = dirname(dir)) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      if ({ ...pkg.dependencies, ...pkg.devDependencies }['expo-router']) return true;
    } catch {}
    if (dirname(dir) === dir) return false;
  }
}

const EXPO_ROUTER = usesExpoRouter();
/** Expo Router route files (src/app or app) export the screen by default; the framework requires it. */
const isExpoRoute = (file) => EXPO_ROUTER && /(^|[\\/])app[\\/]/.test(file);
const HERMES_MISSING = /\.(toSorted|toReversed|toSpliced)\(/;

function tailwindEntryCss(root) {
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = statSync(current);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(basename(current))) {
        for (const entry of readdirSync(current)) stack.push(join(current, entry));
      }
    } else if (current.endsWith('.css') && /@import\s+(url\()?['"]tailwindcss['"]/.test(readFileSync(current, 'utf8'))) {
      return current;
    }
  }
  return null;
}

/** Loads the project's design system with the same loader as `tailwindcss canonicalize`. */
async function tailwindCanonicalizer() {
  if (TAILWIND_MAJOR < 4) return null;
  try {
    const require = createRequire(join(process.cwd(), 'package.json'));
    const { __unstable__loadDesignSystem: loadDesignSystem } = require('@tailwindcss/node');
    let entry = null;
    for (let dir = process.cwd(); !entry; dir = dirname(dir)) {
      if (existsSync(join(dir, 'src'))) entry = tailwindEntryCss(join(dir, 'src'));
      if (existsSync(join(dir, '.git')) || dirname(dir) === dir) break;
    }
    const css = entry ? readFileSync(entry, 'utf8') : '@import "tailwindcss";';
    const designSystem = await loadDesignSystem(css, { base: entry ? dirname(resolve(entry)) : process.cwd() });
    const cache = new Map();
    const canonicalize = (group) => {
      if (!cache.has(group)) {
        const classes = group.split(/\s+/).filter(Boolean);
        const css = designSystem.candidatesToCss(classes);
        const valid = classes.filter((candidate, index) => css[index] !== null);
        const output = valid.length === 0 ? valid : designSystem.canonicalizeCandidates(valid, { collapse: true, logicalToPhysical: true });
        const removed = valid.filter((candidate) => !output.includes(candidate));
        const added = output.filter((candidate) => !valid.includes(candidate));
        cache.set(group, removed.length === 0 && added.length === 0 ? null : { removed, added });
      }
      return cache.get(group);
    };
    return canonicalize;
  } catch (error) {
    console.error(`tailwind-canonical skipped: ${error.message}`);
    return null;
  }
}

const canonicalizeClasses = await tailwindCanonicalizer();
const PLATFORM_STRINGS = new Set(['key', 'code', 'protocol', 'visibilityState', 'readyState', 'pointerType', 'name', 'tagName', 'nodeName', 'NODE_ENV', 'MODE']);
const DIRECT_RETURN_OK =
  /^return(;|\s+(null|undefined|true|false|-?\d[\d_.]*|'[^']*'|"[^"]*"|[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*)\s*;?\s*$)/;
const DIRECT_RETURN_OPENERS =
  /^return\s*[({[<]\s*$|^return\s*[{[]|^return\s*<|^return\s*\($|^return\s+(async\s+)?(\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>|^return\s+function\b/;

function sourceFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = statSync(current);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(basename(current))) {
        for (const entry of readdirSync(current)) stack.push(join(current, entry));
      }
    } else if (/\.(ts|tsx)$/.test(current) && !/\.(test|spec)\.tsx?$/.test(current) && !current.endsWith('.d.ts')) {
      files.push(current);
    }
  }
  return files;
}

function checkFile(file) {
  const findings = [];
  const lines = readFileSync(file, 'utf8').split('\n');
  const isTsx = file.endsWith('.tsx');
  let docStart = -1;
  let componentCount = 0;

  let inTypeDeclaration = false;
  let typeDepth = 0;
  let typeIndent = 0;
  let inShapeBlock = false;
  lines.forEach((line, index) => {
    const lineNo = index + 1;
    if (/^(export\s+)?(type|interface)\s+\w+/.test(line.trim())) {
      inTypeDeclaration = true;
      typeDepth = 0;
      typeIndent = line.length - line.trimStart().length;
    }
    const trimmed = line.trim();
    const add = (rule, message) => findings.push({ file, line: lineNo, rule, message });
    const endsTypeDeclaration = () => {
      typeDepth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      const closesInterface = line.trim() === '}' && line.length - line.trimStart().length === typeIndent;
      if (inTypeDeclaration && typeDepth <= 0 && (line.trim().endsWith(';') || closesInterface)) inTypeDeclaration = false;
    };

    if (docStart === -1 && trimmed.startsWith('/**')) docStart = index;
    if (docStart !== -1 && trimmed.includes('*/')) {
      const length = index - docStart + 1;
      if (length > 2) findings.push({ file, line: docStart + 1, rule: 'jsdoc-length', message: `JSDoc with ${length} lines (max 2)` });
      docStart = -1;
    }

    const isEffect = (text) => /^(React\.)?use(Layout)?Effect\(/.test(text);
    const nextCode = (lines[index + 1] ?? '').trim();
    const previousCode = (lines[index - 1] ?? '').trim();
    const isLineComment = /^\/\/(?!\/ <reference)/.test(trimmed);
    if (isLineComment && !isEffect(nextCode)) add('inline-comment', 'line comment; use JSDoc on the export or move it to docs/');
    if (isEffect(trimmed) && !previousCode.startsWith('//')) add('effect-without-reason', 'effect without the one-line comment naming the external system it syncs');
    if (isEffect(trimmed)) {
      const indent = line.length - line.trimStart().length;
      const body = [];
      for (let next = index + 1; next < lines.length; next += 1) {
        const bodyLine = lines[next];
        const bodyIndent = bodyLine.length - bodyLine.trimStart().length;
        if (bodyLine.trim() !== '' && bodyIndent <= indent) break;
        if (bodyIndent === indent + 2) body.push(bodyLine.trim());
      }
      const inline = trimmed.replace(/^(React\.)?use(Layout)?Effect\(\s*\(\)\s*=>\s*\{?\s*/, '');
      const statements = [inline, ...body].filter((text) => text !== '' && !text.startsWith('//'));
      const eventCall = /^(if\s*\(.*\)\s*)?(set[A-Z]\w*|navigate|dispatch|on[A-Z]\w*)\(/;
      const refMirror = statements.length === 1 && /^[\w.]+\.current\s*=/.test(statements[0]);
      if (statements.some((text) => eventCall.test(text)) || refMirror) add('effect-not-needed', 'effect sets state, navigates, dispatches, calls a callback or mirrors a ref directly; derive it, move it to the handler or use useEffectEvent (EFFECTS.md#necessity-test)');
      else if (/decision|\btodo\b|\bfixme\b|\bmirror/i.test(previousCode)) add('effect-not-needed', 'effect kept with an open decision or a ref mirror in its comment; decide with the user or remove it (EFFECTS.md#necessity-test)');
    }
    if (/(^|[^\w.$])switch\s*\(/.test(trimmed) && !trimmed.startsWith('*')) add('no-switch', 'switch; use a typed map (satisfies Record<Union, T>) or if with early return');
    if (trimmed.includes('{/*')) add('inline-comment', 'JSX comment; remove it or move it to docs/');
    if (/:\s*any\b|\bas any\b|<any>|\bany\[\]/.test(line)) add('no-any', 'any; use unknown + a type guard');
    if (/@ts-(ignore|expect-error|nocheck)/.test(line)) add('no-ts-comment', '@ts-* directive');
    if (/from\s+['"]\.\.\/\.\.\//.test(line)) add('deep-relative-import', "use the @/ alias instead of '../../'");
    if (/^export default\b/.test(trimmed) && !DEFAULT_EXPORT_ALLOWED.has(basename(file)) && !isExpoRoute(file)) add('default-export', 'use a named export');
    if (isTsx && /^export const [A-Z]\w*\s*(:[^=]+)?=\s*(async\s*)?(\([^)]*\)|\w+)\s*=>/.test(trimmed)) add('arrow-component', 'declare the component with `export function`');
    const nextTrimmed = (lines[index + 1] ?? '').trim();
    const jsxInConst =
      /^(const|let)\s+\w+(\s*:[^=]+)?\s*=\s*<[A-Za-z>]/.test(trimmed) ||
      (/^(const|let)\s+\w+(\s*:[^=]+)?\s*=\s*\($/.test(trimmed) && /^<[A-Za-z>]/.test(nextTrimmed));
    if (isTsx && jsxInConst) add('jsx-in-variable', 'JSX stored in a variable; extract a component instead');
    const memoStart = /^(const|let)\s+\w+(\s*:[^=]+)?\s*=\s*(React\.)?useMemo\(/.test(trimmed);
    const memoHead = [trimmed, nextTrimmed, (lines[index + 2] ?? '').trim()].join(' ');
    if (isTsx && memoStart && /useMemo\(\s*\(\)\s*=>\s*\(?\s*<[A-Za-z>]/.test(memoHead)) add('jsx-in-memo', 'JSX wrapped in useMemo; write the element in the JSX and, only if the Profiler asks, memo the child component (PERFORMANCE.md#memoized-jsx)');
    if (/^return\s*\{[^}]*\b[A-Za-z_$][\w$]*\s*:\s*(?!(?:true|false|null|undefined|NaN|Infinity|[A-Z][A-Z0-9_]*)\b)[A-Za-z_$][\w$]*\s*[,}]/.test(trimmed)) add('rename-in-return', 'value renamed inside the return object; rename the declaration and use shorthand');
    const isCodeLine = !/^(\/\/|\*|\/\*)/.test(trimmed);
    const comparedLiteral = [...trimmed.matchAll(/([\w$]+)\s*[!=]==\s*(?:'[^']|"[^"])|(?:[^']'|[^"]")\s*[!=]==\s*[\w$.?]*?([\w$]+)\b/g)];
    const appLiteral = comparedLiteral.some((match) => !PLATFORM_STRINGS.has(match[1] ?? match[2]));
    if (isCodeLine && appLiteral && !/\btypeof\b/.test(trimmed)) add('magic-string', "string literal compared; use the union's `as const` object (State.Kind) or a named predicate");
    if (isCodeLine && (/\btypeof [A-Z][A-Z0-9_]*\.[A-Z]/.test(trimmed) || /\(typeof [A-Z][A-Z0-9_]*\)\[keyof typeof/.test(trimmed))) add('type-from-const', "type derived from a const object; declare the literals in the type and add `as const satisfies Record<string, Type>` to the object");
    if (isCodeLine && !inTypeDeclaration && !/^\||\b(Extract|Exclude)</.test(trimmed) && /\b(kind|status|phase)\s*:\s*['"]/.test(trimmed)) add('magic-string', "string literal as a discriminant; use the union's `as const` object");
    const propStart = /^([a-zA-Z][\w-]*)=\{/.exec(trimmed);
    if (isTsx && propStart && propStart[1] !== 'children') {
      const braces = (text) => (text.match(/\{/g) ?? []).length - (text.match(/\}/g) ?? []).length;
      const value = trimmed.slice(propStart[0].length - 1);
      const block = [value];
      let depth = braces(value);
      for (let next = index + 1; depth > 0 && next < lines.length; next += 1) {
        const blockLine = lines[next].trim();
        block.push(blockLine);
        depth += braces(blockLine);
      }
      if (block.some((text) => /<[a-z][a-z0-9]*(\s|>|\/|$)/.test(text))) {
        add('jsx-in-prop', 'markup inside a prop; extract it into a component and pass that element (COMPONENTS-STYLING.md#no-markup-in-props)');
      }
    }
    if (isCodeLine && !/^(export\s+)?type\s+\w+/.test(trimmed) && /\bComponentProps<typeof\s+\w+>\[/.test(trimmed)) add('inline-derived-type', "derived type written inline; export a named type next to its source (`export type IconName = IconProps['name']`) and use the name (CODE-STYLE.md#typing-props-and-data)");
    if (line !== trimmed && /^function\s+render[A-Z]\w*\s*\(/.test(trimmed)) add('inner-render-function', 'render function declared inside another function; keep the arrow in a const named after the option it fills (`const header = (…) => …; return header;`) (CODE-STYLE.md#exports-and-functions)');
    if (isCodeLine && /\{\s*\w+\s*=[^}]*\}\s*:\s*\w+(<[^>]*>)?\s*=\s*\{\s*\}/.test(trimmed)) add('param-default-destructure', 'options defaulted inside the signature (`{ a = … }: Options = {}`); make the fields required and default the parameter to a named const (CODE-STYLE.md#typing-props-and-data)');
    if (/^(export\s+)?(interface\s+\w+|type\s+\w+(<[^>]*>)?\s*=\s*\{)/.test(line) && !/\}\s*;?\s*$/.test(trimmed)) inShapeBlock = true;
    else if (inShapeBlock && /^\}/.test(line)) inShapeBlock = false;
    else if (inShapeBlock && /^\/\*\*/.test(trimmed)) add('field-jsdoc', 'JSDoc on an interface or type field (props or data); give the field a self-explanatory name and keep the JSDoc on the type or component (CODE-STYLE.md#typing-props-and-data)');
    if (isTsx && /^<(input|textarea|TextInput)\b/.test(trimmed)) {
      const tag = [trimmed];
      for (let next = index + 1; !/\/?>\s*$/.test(tag.at(-1)) && next < lines.length; next += 1) tag.push(lines[next].trim());
      const opening = tag.join(' ');
      const noText = /\btype=["'](hidden|checkbox|radio|submit|button|reset|file|range|color|image)["']/.test(opening);
      if (!noText && !/\bplaceholder=/.test(opening)) add('input-placeholder', 'text field without a placeholder; keep the visible label and add a placeholder with an example of what to type (frontend-design FORMS-COPY.md#labels-and-fields)');
    }
    if (isCodeLine && /\.endpoints\.\w+\.select\(/.test(trimmed)) add('rtkq-endpoint-select', 'cache read through `api.endpoints.x.select()`; read it in the component with the generated hook and `selectFromResult` (STATE-DATA.md#server-cache)');
    if (REACT_NATIVE && isTsx && /<Text\b[^>]*className=["'][^"']*\brounded-full\b/.test(trimmed)) add('text-badge', 'round badge drawn on a Text: its height is the line height, so it comes out oval; wrap the count in a View with h-N min-w-N items-center justify-center rounded-full (frontend-design VISUAL-DESIGN.md#count-badges)');
    if (REACT_NATIVE && isCodeLine && HERMES_MISSING.test(trimmed)) add('hermes-builtin', 'array method Hermes does not ship (throws "undefined is not a function" on device); copy and sort: `[...list].sort(…)` (CODE-STYLE.md#react-native-runtime)');
    if (TAILWIND_MAJOR >= 4 && !/^(\/\/|\*|\/\*)/.test(trimmed)) {
      TAILWIND_V3_CLASSES.filter(([pattern]) => pattern.test(line)).forEach(([, message]) => {
        add('tailwind-v3', `${message} (TAILWIND.md, https://tailwindcss.com/docs/upgrade-guide)`);
      });
    }
    if (canonicalizeClasses && isCodeLine && !/^import\b/.test(trimmed)) {
      const literals = [...line.matchAll(/'([^'\\]*)'|"([^"\\]*)"|`([^`$\\]*)`/g)].map((match) => match[1] ?? match[2] ?? match[3]);
      literals.map(canonicalizeClasses).filter(Boolean).forEach(({ removed, added }) => {
        add('tailwind-canonical', `\`${removed.join(' ')}\` → \`${added.join(' ')}\`; write the canonical class (TAILWIND.md#canonical-classes, \`tailwindcss canonicalize\`)`);
      });
    }
    if (isTsx && /key=\{(index|idx|i)\}/.test(line)) add('index-key', 'array index as key; use a stable id from the data');
    if (isTsx && /key=\{[^}]*(Math\.random|randomUUID)/.test(line)) add('generated-key', 'key generated during render; use a stable id from the data');
    const declaresComponent = /^(export\s+)?(function\s+[A-Z]\w*\s*[(<]|const\s+[A-Z]\w*\s*(:[^=]+)?=\s*(async\s*)?(\([^)]*\)|\w+)\s*=>)/;
    if (isTsx && line !== trimmed && declaresComponent.test(trimmed) && !trimmed.startsWith('export')) {
      add('nested-component', 'component declared inside another component; move it to its own file');
    }
    if (isTsx && line === trimmed && declaresComponent.test(trimmed)) {
      componentCount += 1;
      if (componentCount > 1) add('one-component-per-file', 'second component in this file; move it to its own file');
    }
    if (trimmed.startsWith('return') && /^return\b/.test(trimmed) && !DIRECT_RETURN_OK.test(trimmed) && !DIRECT_RETURN_OPENERS.test(trimmed)) {
      add('const-then-return', 'store the computed value in a named const and return it');
    }
    endsTypeDeclaration();
  });
  const hookFile = basename(file).match(/^use[A-Z]\w*\.tsx?$/);
  const inLib = /(^|[\\/])lib[\\/]/.test(file);
  lines.forEach((line, index) => {
    const reactImport = /^import\b.*from\s+['"](react|react-dom|react-router|react-redux)(\/[^'"]*)?['"]/.test(line);
    const storeImport = /^import\b.*from\s+['"](@\/store|(\.\.?\/)+store)(\/[^'"]*)?['"]/.test(line);
    if (inLib && (reactImport || storeImport)) findings.push({ file, line: index + 1, rule: 'lib-imports-react', message: 'lib/ imports React, the router or the store; keep lib/ pure and move the hook to hooks/ (ARCHITECTURE.md)' });
  });
  const inLibHttp = /(^|[\\/])lib[\\/]http[\\/]/.test(file);
  const inHooksRoot = /(^|[\\/])hooks[\\/][^\\/]+\.tsx?$/.test(file);
  const networkCall = /(^|[^\w.])fetch\s*\(|new\s+(EventSource|WebSocket)\s*\(|from\s+['"](expo\/fetch|axios|ky|ofetch)['"]/;
  const apiHookCall = /\buse[A-Z]\w*(Query|Mutation)\s*\(|\buse(Query|Mutation|InfiniteQuery|SuspenseQuery|SWR)\s*\(/;
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    if (inLib && !inLibHttp && networkCall.test(line)) {
      findings.push({ file, line: index + 1, rule: 'http-outside-folder', message: 'network call in lib/ outside lib/http/; move the module to lib/http/ (ARCHITECTURE.md#http-in-its-own-folder)' });
    }
    if (inHooksRoot && (apiHookCall.test(line) || networkCall.test(line))) {
      findings.push({ file, line: index + 1, rule: 'http-outside-folder', message: 'hook calls the API outside hooks/http/; move it to hooks/http/ (ARCHITECTURE.md#http-in-its-own-folder)' });
    }
  });
  lines.forEach((line, index) => {
    if (!/^export function use[A-Z]\w*\s*[(<]/.test(line)) return;
    const end = lines.findIndex((candidate, next) => next > index && /^\}/.test(candidate));
    const length = end === -1 ? 0 : end - index + 1;
    if (length > HOOK_MAX_LINES) findings.push({ file, line: index + 1, rule: 'hook-length', message: `hook with ${length} lines (max ~50); split it by responsibility and move the rules to lib/` });
  });
  if (hookFile && /^use\w*(Page|Screen|Controller)\.tsx?$/.test(basename(file))) {
    findings.push({ file, line: 1, rule: 'god-hook', message: 'hook named after a screen; split it by responsibility and compose small sections' });
  }
  if (hookFile) {
    const start = lines.findIndex((line) => /^ {2}return \{\s*$/.test(line));
    const end = start === -1 ? -1 : lines.findIndex((line, index) => index > start && /^ {2}\};?\s*$/.test(line));
    const values = end === -1 ? 0 : lines.slice(start + 1, end).filter((line) => /^ {4}\S/.test(line) && !/^ {4}[)}\]]/.test(line)).length;
    if (values > 6) findings.push({ file, line: start + 1, rule: 'hook-return-size', message: `hook returns ${values} values (max 6); split it by responsibility` });
  }
  return findings;
}

const roots = process.argv.slice(2);
const targets = roots.length > 0 ? roots : ['src'];
const findings = targets.flatMap((root) => sourceFiles(root).flatMap(checkFile));
const cwd = process.cwd();
for (const finding of findings) {
  console.log(`${relative(cwd, finding.file)}:${finding.line}  ${finding.rule}  ${finding.message}`);
}
const byRule = Object.groupBy ? Object.groupBy(findings, (finding) => finding.rule) : {};
const summary = Object.entries(byRule).map(([rule, list]) => `${rule}=${list.length}`).join(' ');
console.log(findings.length === 0 ? 'house style: clean' : `house style: ${findings.length} finding(s) ${summary}`);
process.exit(findings.length === 0 ? 0 : 1);
