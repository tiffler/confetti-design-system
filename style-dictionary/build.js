import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';

import { registerTransforms } from './transforms/index.js';
import { loadSchema, validateTheme } from './validate-schema.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(root, 'tokens');
const outDir = join(root, 'build', 'portfolio');
const tmpDir = join(root, 'build', '.tmp');

registerTransforms();

const schema = loadSchema(join(tokensDir, '_schema.json'));

const glob = (p) => join(tokensDir, p);
const listNames = (dir) =>
  readdirSync(join(tokensDir, dir))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

const modes = listNames('modes').sort(); // dark, high-contrast, light
const themes = listNames('themes').sort(); // confetti, ocean
const overrideFiles = readdirSync(join(tokensDir, 'overrides')).filter((f) => f.endsWith('.json'));

// overrides are named "<theme>.<mode>.json" — a theme's own neutrals for that mode
// and/or a documented accessibility lift.
const overridesFor = (theme, mode) =>
  overrideFiles.filter((f) => f === `${theme}.${mode}.json`).map((f) => glob(`overrides/${f}`));

const primitiveSrc = glob('primitives/*.json');
const baseSrc = glob('semantic/base.json');
const wiringSrc = glob('semantic/theme-roles.json');
const modeSrc = (m) => glob(`modes/${m}.json`);
const themeSrc = (t) => glob(`themes/${t}.json`);
const componentSrc = glob('component/portfolio/*.json');

/** Runs one Style Dictionary pass and returns the generated file contents. */
async function build({ name, source, filter, format }) {
  const destination = `${name}.out`;
  const sd = new StyleDictionary({
    source,
    log: { warnings: 'disabled', verbosity: 'silent' },
    platforms: {
      css: { transformGroup: 'css', buildPath: `${tmpDir}/`, files: [{ destination, filter, format }] },
    },
  });
  await sd.buildPlatform('css');
  return readFileSync(join(tmpDir, destination), 'utf8');
}

rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const banner = `/**
 * GENERATED FILE — do not edit.  Source: tokens/  •  Build: npm run tokens
 *
 * Independent axes, combined by the CSS cascade — NOT a per-combination matrix.
 *   :root                          primitives + base semantic; theme wiring + component tokens as var() refs
 *   [data-mode="light|dark"]       base neutrals — surfaces, text, borders, focus ring, shadow
 *   [data-theme="confetti|adventure|…"]  brand-kit inputs (brand, accents, shape, fonts)
 *   [data-theme][data-mode]        a theme's own neutrals + documented a11y lifts (tokens/overrides/)
 *
 * THEMING: the :root wiring binds every themeable role to a brand-kit input (see
 * tokens/themes/confetti.json). A downstream demo re-skins the system by setting only
 * those inputs in its own [data-theme="<name>"] block — optionally per mode with an
 * added [data-theme="<name>"][data-mode="dark"] block. No changes to Confetti needed.
 *
 * Set both attributes on the root element. Component + wiring tokens are var() references,
 * so they resolve against whatever mode+theme is active — the axes never multiply into a matrix.
 */\n\n`;

const blocks = [];

// :root — primitives + base semantic (resolved literals) --------------------------
const rootLiteral = await build({
  name: 'root',
  source: [primitiveSrc, baseSrc],
  filter: 'confetti/all',
  format: 'confetti/css-declarations',
});
blocks.push(`:root {\n${rootLiteral}\n}`);

// :root — theme wiring: themeable roles as var() references to the brand-kit inputs.
// Emitted once (theme-independent) so overriding an input in a [data-theme] block
// repoints every role via the cascade — the mechanism behind project-level theming.
const wiringRefs = await build({
  name: 'wiring',
  source: [primitiveSrc, baseSrc, themeSrc(schema.baseTheme), wiringSrc],
  filter: 'confetti/wiring',
  format: 'confetti/css-declarations-refs',
});
blocks.push(`/* Theme wiring — themeable roles as var() refs to the brand-kit inputs (tokens/themes/). */\n:root {\n${wiringRefs}\n}`);

// :root — component tokens as var() references (compose the active mode+theme) -----
const componentRefs = await build({
  name: 'component',
  source: [primitiveSrc, baseSrc, wiringSrc, modeSrc(schema.baseMode), themeSrc(schema.baseTheme), componentSrc],
  filter: 'confetti/component',
  format: 'confetti/css-declarations-refs',
});
blocks.push(`/* Component tokens — var() references that compose the active mode + theme. */\n:root {\n${componentRefs}\n}`);

// [data-mode] blocks — neutrals ---------------------------------------------------
for (const mode of modes) {
  const decls = await build({
    name: `mode-${mode}`,
    source: [primitiveSrc, baseSrc, modeSrc(mode)],
    filter: 'confetti/mode',
    format: 'confetti/css-declarations',
  });
  blocks.push(`[data-mode="${mode}"] {\n${decls}\n}`);
}

// [data-theme] blocks — brand + accent --------------------------------------------
for (const theme of themes) {
  const decls = await build({
    name: `theme-${theme}`,
    source: [primitiveSrc, themeSrc(theme)],
    filter: 'confetti/theme',
    format: 'confetti/css-declarations',
  });
  blocks.push(`[data-theme="${theme}"] {\n${decls}\n}`);
}

// [data-theme][data-mode] blocks — a theme's own neutrals + documented a11y lifts ---
for (const file of overrideFiles) {
  const [theme, mode] = file.replace(/\.json$/, '').split('.');
  const decls = await build({
    name: `ovr-${theme}-${mode}`,
    source: [primitiveSrc, glob(`overrides/${file}`)],
    filter: 'confetti/override',
    format: 'confetti/css-declarations',
  });
  blocks.push(`/* Theme override (own neutrals / a11y lift) — see tokens/overrides/${file} */\n[data-theme="${theme}"][data-mode="${mode}"] {\n${decls}\n}`);
}

// --- Resolved index, per theme×mode (for Storybook / DTCG / Tailwind + validation) --
const tokenIndex = {};
for (const theme of themes) {
  for (const mode of modes) {
    const source = [primitiveSrc, baseSrc, wiringSrc, modeSrc(mode), themeSrc(theme), ...overridesFor(theme, mode), componentSrc];
    const flat = JSON.parse(
      await build({ name: `idx-${theme}-${mode}`, source, filter: 'confetti/all', format: 'confetti/json-flat' })
    );
    validateTheme({ schema, theme, mode, builtNames: new Set(Object.keys(flat)) });
    tokenIndex[`${theme}.${mode}`] = flat;
  }
}

writeFileSync(join(outDir, 'tokens.css'), banner + blocks.join('\n\n') + '\n');
writeFileSync(join(outDir, 'tokens.json'), JSON.stringify(tokenIndex, null, 2) + '\n');

// --- Tailwind theme: maps token names to var() references ---------------------
const themeFrom = (prefix, flat) =>
  Object.fromEntries(
    Object.keys(flat)
      .filter((name) => name.startsWith(prefix))
      .map((name) => [name.slice(prefix.length), `var(--${name})`])
  );

const base = tokenIndex[`${schema.baseTheme}.${schema.baseMode}`];
const tailwindTheme = {
  colors: themeFrom('color-', base),
  spacing: themeFrom('space-', base),
  borderRadius: themeFrom('radius-', base),
  fontFamily: themeFrom('font-family-', base),
  fontSize: themeFrom('font-size-', base),
  fontWeight: themeFrom('font-weight-', base),
  letterSpacing: themeFrom('font-tracking-', base),
  lineHeight: themeFrom('font-leading-', base),
  boxShadow: themeFrom('shadow-', base),
  zIndex: themeFrom('z-', base),
};

writeFileSync(
  join(outDir, 'tailwind.theme.js'),
  `// GENERATED FILE — do not edit. Build: npm run tokens\n` +
    `// Values are var() references, so a Tailwind class resolves against\n` +
    `// whichever theme+mode is active at runtime.\n` +
    `export default ${JSON.stringify(tailwindTheme, null, 2)};\n`
);

// --- W3C DTCG export ---------------------------------------------------------
// Fully-resolved values per theme+mode, so an importer that cannot run this build
// still receives exact values rather than inferring them from the CSS.

function dtcgType(name) {
  if (name.startsWith('color-')) return 'color';
  if (name.startsWith('space-') || name.startsWith('size-')) return 'dimension';
  if (name.startsWith('radius-')) return 'dimension';
  if (name.startsWith('border-width-')) return 'dimension';
  if (name.startsWith('focus-ring-width') || name.startsWith('focus-ring-offset')) return 'dimension';
  if (name.startsWith('font-family-')) return 'fontFamily';
  if (name.startsWith('font-size-')) return 'dimension';
  if (name.startsWith('font-weight-')) return 'fontWeight';
  if (name.startsWith('font-leading-') || name.startsWith('font-tracking-')) return 'number';
  if (name.startsWith('shadow-')) return 'shadow';
  if (name.startsWith('motion-duration-')) return 'duration';
  if (name.startsWith('motion-easing-')) return 'cubicBezier';
  return 'other';
}

function nest(flat) {
  const tree = {};
  for (const [name, token] of Object.entries(flat)) {
    const path = token.path ?? name.split('-');
    let node = tree;
    for (const segment of path.slice(0, -1)) {
      node[segment] ??= {};
      node = node[segment];
    }
    const leaf = path[path.length - 1];
    node[leaf] = {
      $value: token.value,
      $type: dtcgType(name),
      ...(token.comment ? { $description: token.comment } : {}),
      $extensions: { 'com.confetti.cssVariable': `--${name}` },
    };
  }
  return tree;
}

const dtcg = {
  $description:
    'Confetti design tokens, W3C DTCG format. One group per theme+mode; values are fully resolved (accessibility exceptions applied).',
  ...Object.fromEntries(Object.entries(tokenIndex).map(([key, flat]) => [key.replace('.', '-'), nest(flat)])),
};

writeFileSync(join(outDir, 'tokens.dtcg.json'), JSON.stringify(dtcg, null, 2) + '\n');

rmSync(tmpDir, { recursive: true, force: true });

console.log(
  `✓ tokens built — ${themes.length} theme(s) × ${modes.length} modes, independent axes` +
    `\n  themes: ${themes.join(', ')}` +
    `\n  modes:  ${modes.join(', ')}` +
    `\n  overrides: ${overrideFiles.length} (${overrideFiles.map((f) => f.replace(/\.json$/, '')).join(', ') || 'none'})` +
    `\n  → build/portfolio/tokens.css, tokens.json, tokens.dtcg.json, tailwind.theme.js`
);
