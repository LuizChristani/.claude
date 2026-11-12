#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, relative, resolve } from 'node:path';
import process from 'node:process';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', '.expo', '.next', 'Pods', 'vendor', 'generated', 'tests', '__tests__', '__mocks__']);
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const TEST_FILE = /\.(test|spec|bench)\.[cm]?[jt]sx?$/;
const LOOP = /\bfor\s*(await\s*)?\(|\bwhile\s*\(|\.(forEach|map|flatMap|filter|reduce|some|every|find|findIndex)\s*\(/g;
const INNER = [
  [/\.(find|findIndex|findLast|filter|includes|indexOf|lastIndexOf|some|every)\s*\(/, 'linear-search-in-loop', 'linear search inside a loop: O(outer × inner); consider a Map/Set index'],
  [/\bfor\s*(await\s*)?\(|\bwhile\s*\(|\.(forEach|map|flatMap|reduce)\s*\(/, 'nested-loop', 'nested loop: O(outer × inner), unless the inner collection is fixed or belongs to the outer item'],
  [/\.(sort|toSorted)\s*\(/, 'sort-in-loop', 'sort inside a loop: O(outer × n log n); sort once outside'],
  [/\bawait\b/, 'await-in-loop', 'await inside a loop: one I/O round trip per item (possible N+1)'],
  [/\b(fetch|axios\.\w+|\w+\.(query|execute|findOne|findMany|findUnique|findAll|get|post))\s*\(/, 'io-in-loop', 'I/O call inside a loop: one call per item (possible N+1)'],
];
const SPREAD_ACCUMULATE = /\.reduce\s*\([^]*?=>\s*\(?\s*[[{]\s*\.\.\.(acc|accumulator|result|memo|previous|prev)\b/;

/** Source files under root, skipping tests, dependencies and build output. */
function sourceFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = statSync(current);
    if (stat.isDirectory() && !SKIP_DIRS.has(basename(current))) {
      readdirSync(current).forEach((entry) => stack.push(join(current, entry)));
    }
    if (stat.isFile() && EXTENSIONS.has(extname(current)) && !TEST_FILE.test(current) && !current.endsWith('.d.ts')) files.push(current);
  }
  return files;
}

/** Start and end of the body of the loop matched at index: the statement after a for/while header, or the callback arguments. */
function loopBody(text, loop) {
  const open = loop.index + loop[0].length - 1;
  const headerEnd = blockEnd(text, open);
  if (headerEnd === -1) return null;
  if (!/^(for|while)/.test(loop[0])) return { start: open + 1, end: headerEnd - 1 };
  const next = text.slice(headerEnd).search(/\S/);
  const start = headerEnd + next;
  const end = text[start] === '{' ? blockEnd(text, start) : text.indexOf(';', start) + 1;
  if (end <= 0) return null;
  return { start, end };
}

/** Index just past the bracket that closes the first bracket opened at or after start; -1 when unbalanced. */
function blockEnd(text, start) {
  let depth = 0;
  let opened = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if ('([{'.includes(char)) {
      depth += 1;
      opened = true;
    }
    if (')]}'.includes(char)) depth -= 1;
    if (opened && depth === 0) return index + 1;
  }
  return -1;
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/** Candidates in one file: costly calls inside a loop body and spread accumulation in reduce. */
function checkFile(file) {
  const text = readFileSync(file, 'utf8');
  const seen = new Set();
  const findings = [];
  const add = (index, rule, message, loopLine) => {
    const line = lineOf(text, index);
    const key = `${line}:${rule}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push({ file, line, rule, message: `${message} (loop at line ${loopLine})` });
  };
  [...text.matchAll(LOOP)].forEach((loop) => {
    const range = loopBody(text, loop);
    if (range === null) return;
    const body = text.slice(range.start, range.end);
    const loopLine = lineOf(text, loop.index);
    INNER.forEach(([pattern, rule, message]) => {
      const global = new RegExp(pattern.source, 'g');
      [...body.matchAll(global)].forEach((match) => add(range.start + match.index, rule, message, loopLine));
    });
  });
  const lines = text.split('\n');
  lines.forEach((_, index) => {
    const window = lines.slice(index, index + 3).join('\n');
    if (/\.reduce\s*\(/.test(lines[index]) && SPREAD_ACCUMULATE.test(window)) {
      findings.push({ file, line: index + 1, rule: 'spread-accumulate', message: 'reduce copies the accumulator each step: O(n²) time and allocation; use push, flatMap or Object.fromEntries' });
    }
  });
  return findings;
}

const roots = process.argv.slice(2);
const targets = (roots.length > 0 ? roots : ['src']).map((root) => resolve(root));
const findings = targets.flatMap((root) => sourceFiles(root).flatMap(checkFile));
const cwd = process.cwd();
findings.forEach((finding) => console.log(`${relative(cwd, finding.file)}:${finding.line}  ${finding.rule}  ${finding.message}`));
console.log(findings.length === 0 ? 'complexity scan: no candidates' : `complexity scan: ${findings.length} candidate(s) — candidates, not findings: confirm each with ANALYSIS.md and the real n`);
