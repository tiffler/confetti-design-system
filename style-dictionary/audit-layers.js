#!/usr/bin/env node
/**
 * Audits the three-tier contract that the architecture claims to enforce.
 *
 * The build already fails when a theme is missing a required semantic token. That checks
 * completeness, not discipline: nothing stopped a component token from reaching past
 * the semantic layer into a primitive, or from inlining a raw value. This does.
 *
 * Rules, by layer:
 *   primitives — hold literal values. May reference other primitives (shadow.hard-ink
 *                composes color.ink), never semantic or component tokens.
 *   semantic   — must reference primitives. No literals, no component references.
 *   component  — must reference semantic. No literals, no primitives.
 *
 * Also reports primitives nothing consumes and semantic roles no component uses, which
 * are not errors but are usually either dead weight or a missing component token.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const TOKENS = join(ROOT, 'tokens');

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.json') && entry !== '_schema.json') files.push(full);
  }
})(TOKENS);

const layerOf = (file) => {
  const rel = relative(TOKENS, file);
  if (rel.startsWith('primitives')) return 'primitive';
  if (rel.startsWith('semantic')) return 'semantic';
  if (rel.startsWith('component')) return 'component';
  return 'unknown';
};

/**
 * Every token declaration, as a flat list. Deliberately not keyed by path: themes declare
 * the same paths in light.json and dark.json, and a Map would silently drop one of them
 * along with every reference it makes.
 */
const declarations = []; // {path, layer, file, value}
/** Path -> layer, for resolving what a reference points at. */
const layerByPath = new Map();
const REF = /\{([^}]+?)(?:\.value)?\}/g;

function flatten(node, path, layer, file) {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    if (Object.prototype.hasOwnProperty.call(node, 'value') && typeof node.value !== 'object') {
      const key = path.join('.');
      declarations.push({ path: key, layer, file, value: String(node.value) });
      layerByPath.set(key, layer);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') || key === 'comment') continue;
      flatten(child, [...path, key], layer, file);
    }
  }
}

for (const file of files) {
  const json = JSON.parse(readFileSync(file, 'utf8'));
  flatten(json, [], layerOf(file), file);
}

const refsIn = (value) => [...value.matchAll(REF)].map((m) => m[1]);
const problems = [];
const consumed = new Set();

const seen = new Set();
for (const token of declarations) {
  const references = refsIn(token.value);

  if ((token.layer === 'semantic' || token.layer === 'component') && references.length === 0) {
    const key = `${token.layer}:${token.path}:literal`;
    if (!seen.has(key)) {
      seen.add(key);
      problems.push({
        severity: 'error',
        path: token.path,
        file: token.file,
        message: `${token.layer} token holds the literal "${token.value}" instead of referencing the layer below`,
      });
    }
    continue;
  }

  for (const ref of references) {
    consumed.add(ref);
    const targetLayer = layerByPath.get(ref);
    if (!targetLayer) {
      problems.push({ severity: 'error', path: token.path, file: token.file, message: `references "${ref}", which does not exist` });
      continue;
    }

    const allowed = {
      primitive: ['primitive'],
      semantic: ['primitive'],
      component: ['semantic'],
    }[token.layer];

    if (!allowed.includes(targetLayer)) {
      const key = `${token.path}:${ref}`;
      if (seen.has(key)) continue;
      seen.add(key);
      problems.push({
        severity: 'error',
        path: token.path,
        file: token.file,
        message: `${token.layer} token references a ${targetLayer} token ("${ref}") — allowed: ${allowed.join(', ')}`,
      });
    }
  }
}

const uniquePaths = (layer) => [...new Set(declarations.filter((d) => d.layer === layer).map((d) => d.path))];
const unusedPrimitives = uniquePaths('primitive').filter((p) => !consumed.has(p));
const unusedSemantic = uniquePaths('semantic').filter((p) => !consumed.has(p));

const counts = {
  primitive: uniquePaths('primitive').length,
  semantic: uniquePaths('semantic').length,
  component: uniquePaths('component').length,
};

console.log(`\nTokens: ${counts.primitive} primitive · ${counts.semantic} semantic · ${counts.component} component\n`);

const errors = problems.filter((p) => p.severity === 'error');
if (errors.length) {
  console.log(`✖ ${errors.length} layering violation(s):\n`);
  for (const p of errors) {
    console.log(`  ${p.path}\n    ${p.message}\n    ${relative(ROOT, p.file)}\n`);
  }
} else {
  console.log('✓ three-tier contract holds: no literals below primitives, no layer skipping\n');
}

if (unusedPrimitives.length) {
  console.log(`ℹ ${unusedPrimitives.length} primitive(s) no semantic role aliases.`);
  console.log('  Not a defect — primitives are a palette, and a value can exist before a');
  console.log('  role needs it. Worth a look if one has been sitting unused for a while.');
  console.log(`  ${unusedPrimitives.join(', ')}\n`);
}

if (unusedSemantic.length) {
  console.log(`ℹ ${unusedSemantic.length} semantic role(s) no component token consumes.`);
  console.log('  Also not a defect: the semantic layer is the public API for application');
  console.log('  code, not only an input to component tokens. Heading sizes and page');
  console.log('  surfaces are consumed directly by app CSS, which is the intent.');
  console.log(`  ${unusedSemantic.join(', ')}\n`);
}

process.exit(errors.length ? 1 : 0);
