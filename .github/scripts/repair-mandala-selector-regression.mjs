import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const path = 'public/mandala-v2.html';
let source = readFileSync(path, 'utf8');

function replaceOnce(before, after, label) {
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) throw new Error(`${label}: expected exactly one match, found ${occurrences}`);
  source = source.replace(before, () => after);
}

replaceOnce(
  `    $('[data-toggle="animate"]').forEach(b=>{`,
  `    $$('[data-toggle="animate"]').forEach(b=>{`,
  'animate switch selector',
);
replaceOnce(
  `    $('[data-toggle]').forEach(el=>{`,
  `    $$('[data-toggle]').forEach(el=>{`,
  'switch sync selector',
);
replaceOnce(
  `  $('[data-toggle]').forEach(btn=>btn.addEventListener('click',()=>{`,
  `  $$('[data-toggle]').forEach(btn=>btn.addEventListener('click',()=>{`,
  'switch listener selector',
);
replaceOnce(
  `  const tabs=$('[data-tab]');`,
  `  const tabs=$$('[data-tab]');`,
  'tab collection selector',
);

const expected = [
  `$$('[data-toggle="animate"]').forEach`,
  `$$('[data-toggle]').forEach(el=>`,
  `$$('[data-toggle]').forEach(btn=>`,
  `const tabs=$$('[data-tab]');`,
];
for (const needle of expected) {
  if (!source.includes(needle)) throw new Error(`Missing repaired selector: ${needle}`);
}

const forbiddenPatterns = [
  /^\s{4}\$\('\[data-toggle="animate"\]'\)\.forEach/m,
  /^\s{4}\$\('\[data-toggle\]'\)\.forEach\(el=>/m,
  /^\s{2}\$\('\[data-toggle\]'\)\.forEach\(btn=>/m,
  /^\s{2}const tabs=\$\('\[data-tab\]'\);/m,
];
for (const pattern of forbiddenPatterns) {
  if (pattern.test(source)) throw new Error(`Single-element selector still used as a collection: ${pattern}`);
}

const scriptMatch = source.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
if (!scriptMatch) throw new Error('Unable to extract inline script');
const tempDir = mkdtempSync(join(tmpdir(), 'mandala-selector-check-'));
const tempScript = join(tempDir, 'inline.js');
writeFileSync(tempScript, scriptMatch[1]);
const syntax = spawnSync(process.execPath, ['--check', tempScript], { encoding: 'utf8' });
rmSync(tempDir, { recursive: true, force: true });
if (syntax.status !== 0) throw new Error(syntax.stderr || syntax.stdout || 'Inline JavaScript syntax check failed');

writeFileSync(path, source);
console.log('Repaired all collection selector calls and validated inline JavaScript.');
