#!/usr/bin/env node
/**
 * Audits what component CSS reads.
 *
 * The architecture says a component knows nothing about theme or mode: its CSS may read only
 * its OWN component tokens (`var(--button-primary-fill)`) and the local custom properties it
 * sets itself (`--cf-*`). Never a semantic role, never a primitive. audit-layers.js enforces
 * the token tiers; this enforces that the CSS respects them, and that nothing reads a variable
 * that no longer exists — which fails silently in CSS, as a property that just does not apply.
 *
 * Exits non-zero on any violation.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const COMPONENT_TOKENS = join(ROOT, 'tokens', 'component');
const COMPONENT_CSS = join(ROOT, 'src', 'components');
const BUILT_CSS = join(ROOT, 'build', 'portfolio', 'tokens.css');

const walk = (dir, test, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, test, out);
    else if (test(entry)) out.push(full);
  }
  return out;
};

/** Every component token's CSS name: its path joined with hyphens. */
function componentTokenNames() {
  const names = new Set();
  const visit = (node, path) => {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (value && typeof value === 'object') {
        if ('$value' in value || 'value' in value) names.add([...path, key].join('-'));
        else visit(value, [...path, key]);
      }
    }
  };
  for (const file of walk(COMPONENT_TOKENS, (f) => f.endsWith('.json'))) {
    visit(JSON.parse(readFileSync(file, 'utf8')), []);
  }
  return names;
}

const componentTokens = componentTokenNames();
const emitted = new Set([...readFileSync(BUILT_CSS, 'utf8').matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1].slice(2)));

const violations = [];
for (const file of walk(COMPONENT_CSS, (f) => f.endsWith('.css'))) {
  const css = readFileSync(file, 'utf8');
  // Custom properties the component defines itself — in its CSS, or inline from its TSX
  // (Slider sets --cf-slider-fraction per instance) — which its CSS may then read back.
  const siblings = readdirSync(dirname(file))
    .filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
    .map((f) => readFileSync(join(dirname(file), f), 'utf8'));
  const defined = (text, pattern) => [...text.matchAll(pattern)].map((m) => m[1].slice(2));
  const local = new Set([
    ...defined(css, /(--cf-[a-z0-9-]+)\s*:/g),
    // In TSX any mention counts: it is written as an inline-style key, in several spellings.
    ...siblings.flatMap((text) => defined(text, /(--cf-[a-z0-9-]+)/g)),
  ]);

  for (const [, name] of css.matchAll(/var\(--([a-z0-9-]+)/g)) {
    if (name.startsWith('cf-') && local.has(name)) continue;
    if (!componentTokens.has(name)) {
      violations.push(`${relative(ROOT, file)}: reads --${name}, which is not a component token`);
    } else if (!emitted.has(name)) {
      violations.push(`${relative(ROOT, file)}: reads --${name}, which the build does not emit`);
    }
  }
}

const unique = [...new Set(violations)];
if (unique.length) {
  console.error(`✖ ${unique.length} component-CSS violation(s):`);
  for (const v of unique) console.error(`  ${v}`);
  process.exit(1);
}
console.log(`✓ component CSS reads only component tokens (${componentTokens.size} defined)`);
