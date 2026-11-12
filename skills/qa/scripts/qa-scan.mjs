#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', '.expo', '.next', 'Pods', 'vendor', '__pycache__', '.venv', 'venv', '.gradle', 'generated', 'tmp']);
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.go', '.py', '.kt', '.java']);
const TEST_FILE = /(\.(test|spec)\.[cm]?[jt]sx?$)|(_test\.(go|py)$)|(^test_.*\.py$)|((Test|Tests)\.(kt|java)$)/;
const TEST_DIR = /(^|[\\/])(tests?|__tests__|__mocks__|e2e|androidTest|fixtures)([\\/]|$)/;
const NOT_UNIT = /(\.d\.ts$)|(\.config\.[cm]?[jt]s$)|(\.stories\.[jt]sx?$)|(^(index|main|setup|vite-env\.d)\.[jt]sx?$)|(^__init__\.py$)/;
const MARKER_START = /\b(it|test|describe)\.(fails|failing|skip)\s*\(|\bx(it|test|describe)\s*\(|\bfails:\s*true\b|pytest\.mark\.(xfail|skip)\b|\bt\.Skip(f|Now)?\s*\(|@(Disabled|Ignore)\b/;
const CONDITIONAL_SKIP = /\b(it|test|describe)\.skip\s*\(\s*[^'"`)\s]/;
const QA_ID = /QA-\d{4}-\d{2}-\d{2}-\d+/g;
const IMPORT_SPEC = /(?:from\s+|import\s*\(\s*|require\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
const PY_IMPORT = /^\s*(?:from\s+([\w.]+)\s+import\s+([\w, ]+)|import\s+([\w.]+))/gm;

/** Every file under root, skipping build output, dependencies and VCS folders. */
function walk(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = statSync(current);
    if (stat.isDirectory() && !SKIP_DIRS.has(basename(current))) {
      readdirSync(current).forEach((entry) => stack.push(join(current, entry)));
    }
    if (stat.isFile()) files.push(current);
  }
  return files;
}

const withoutExtension = (file) => file.slice(0, file.length - extname(file).length);
/** Import specifier without a source extension; `./user.service` keeps `.service`, `./user.service.js` drops `.js`. */
const specifierPath = (spec) => (SOURCE_EXTENSIONS.has(extname(spec)) ? withoutExtension(spec) : spec);

/** JSONC to JSON: drops // and block comments outside strings, then trailing commas. */
function stripJsonComments(text) {
  let output = '';
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    const pair = text.slice(index, index + 2);
    if (char === '"') {
      const close = text.slice(index + 1).search(/(?<!\\)"/);
      const end = close === -1 ? text.length : index + close + 2;
      output += text.slice(index, end);
      index = end;
    } else if (pair === '//') {
      const newline = text.indexOf('\n', index);
      index = newline === -1 ? text.length : newline;
    } else if (pair === '/*') {
      const close = text.indexOf('*/', index + 2);
      index = close === -1 ? text.length : close + 2;
    } else {
      output += char;
      index += 1;
    }
  }
  const json = output.replace(/,(\s*[}\]])/g, '$1');
  return json;
}

/** Import aliases from compilerOptions.paths of the root tsconfig.json, longest first; falls back to @/ and ~/ → src/. */
function tsconfigAliases(root) {
  const file = join(root, 'tsconfig.json');
  const fallback = [['@/', `${join(root, 'src')}/`, true], ['~/', `${join(root, 'src')}/`, true]];
  if (!existsSync(file)) return fallback;
  const text = stripJsonComments(readFileSync(file, 'utf8'));
  const options = JSON.parse(text).compilerOptions ?? {};
  const base = resolve(root, options.baseUrl ?? '.');
  const entries = Object.entries(options.paths ?? {}).map(([alias, [target]]) => {
    const wildcard = alias.endsWith('*');
    const entry = [alias.replace(/\*$/, ''), resolve(base, target.replace(/\*$/, '')) + (wildcard ? '/' : ''), wildcard];
    return entry;
  });
  const aliases = [...entries, ...fallback].sort((left, right) => right[0].length - left[0].length);
  return aliases;
}

/** Rewrites an aliased import specifier to an absolute path; other specifiers stay as they are. */
function unalias(spec, aliases) {
  const match = aliases.find(([alias, , wildcard]) => (wildcard ? spec.startsWith(alias) : spec === alias));
  if (!match) return spec;
  const [alias, target, wildcard] = match;
  const resolved = wildcard ? target + spec.slice(alias.length) : target;
  return resolved;
}

/** Absolute module paths (no extension) a JS/TS test file imports, resolving ./ ../ and the tsconfig path aliases. */
function jsTargets(testFile, aliases) {
  const content = readFileSync(testFile, 'utf8');
  const specs = [...content.matchAll(IMPORT_SPEC)].map((match) => match[1]);
  const aliased = specs.map((spec) => unalias(spec, aliases));
  const local = aliased.filter((spec) => spec.startsWith('.') || spec.startsWith('/'));
  const targets = local.map((spec) => specifierPath(spec.startsWith('/') ? spec : resolve(dirname(testFile), spec)));
  return targets.flatMap((target) => [target, join(target, 'index')]);
}

/** Dotted module paths a Python test file imports, as path suffixes. */
function pyTargets(testFile) {
  const content = readFileSync(testFile, 'utf8');
  const matches = [...content.matchAll(PY_IMPORT)];
  const targets = matches.flatMap((match) => {
    const base = (match[1] ?? match[3]).replaceAll('.', '/');
    const names = (match[2] ?? '').split(',').map((name) => name.trim()).filter(Boolean);
    return [base, ...names.map((name) => `${base}/${name}`)];
  });
  return targets;
}

/** Source files that no test imports (JS/TS/Python), that live in a Go package without _test.go, or that have no <Name>Test (Kotlin/Java). */
function untestedFiles(root, files) {
  const tests = files.filter((file) => TEST_FILE.test(basename(file)));
  const sources = files.filter((file) => SOURCE_EXTENSIONS.has(extname(file)) && !TEST_FILE.test(basename(file)) && !TEST_DIR.test(relative(root, file)) && !NOT_UNIT.test(basename(file)));
  const aliases = tsconfigAliases(root);
  const jsCovered = new Set(tests.filter((file) => /\.[cm]?[jt]sx?$/.test(file)).flatMap((file) => jsTargets(file, aliases)));
  const pyCovered = tests.filter((file) => file.endsWith('.py')).flatMap(pyTargets);
  const goTestedDirs = new Set(tests.filter((file) => file.endsWith('_test.go')).map(dirname));
  const jvmTested = new Set(tests.filter((file) => /\.(kt|java)$/.test(file)).map((file) => basename(withoutExtension(file)).replace(/Tests?$/, '')));
  const isTested = (file) => {
    const extension = extname(file);
    if (extension === '.go') return goTestedDirs.has(dirname(file));
    if (extension === '.py') return pyCovered.some((target) => withoutExtension(file).endsWith(target));
    if (extension === '.kt' || extension === '.java') return jvmTested.has(basename(withoutExtension(file)));
    return jsCovered.has(withoutExtension(file));
  };
  const untested = sources.filter((file) => !isTested(file));
  return untested;
}

/** QA IDs written in the reports at <workspace>/.claude/qa/<app>/, the .claude that holds this skill library. */
function reportedIds(root) {
  const folder = resolve(dirname(fileURLToPath(import.meta.url)), '../../../qa', basename(root));
  const reports = existsSync(folder) ? readdirSync(folder).filter((name) => name.endsWith('.md')) : [];
  const ids = new Set(reports.flatMap((name) => readFileSync(join(folder, name), 'utf8').match(QA_ID) ?? []));
  return ids;
}

/** Known-failure or skip markers without a QA ID, or with an ID missing from the reports. */
function markerFindings(root, files) {
  const ids = reportedIds(root);
  const tests = files.filter((file) => TEST_FILE.test(basename(file)));
  const findings = tests.flatMap((file) => {
    const lines = readFileSync(file, 'utf8').split('\n');
    return lines.flatMap((line, index) => {
      if (!MARKER_START.test(line)) return [];
      const header = lines.slice(index, index + 3).join('\n').split(/=>|\bfunction\b|\{\s*$/m)[0];
      if (CONDITIONAL_SKIP.test(header)) return [];
      const found = header.match(QA_ID) ?? [];
      if (found.length === 0) return [{ file, line: index + 1, rule: 'marker-without-id', message: 'known failure or skip without a QA-AAAA-MM-DD-N id in the test name or reason' }];
      return found.filter((id) => !ids.has(id)).map((id) => ({ file, line: index + 1, rule: 'id-not-reported', message: `${id} is not in any report in .claude/qa/<app>/ at the workspace root` }));
    });
  });
  return findings;
}

const root = resolve(process.argv[2] ?? '.');
const files = walk(root);
const untested = untestedFiles(root, files);
const findings = markerFindings(root, files);

console.log(`untested files (${untested.length}) — heuristic by imports; confirm with the project's coverage report when it has one:`);
untested.forEach((file) => console.log(`  ${relative(root, file)}`));
findings.forEach((finding) => console.log(`${relative(root, finding.file)}:${finding.line}  ${finding.rule}  ${finding.message}`));
console.log(findings.length === 0 ? 'qa markers: clean' : `qa markers: ${findings.length} finding(s)`);
process.exit(findings.length === 0 ? 0 : 1);
