import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';

import { registerTransforms } from './transforms/index.js';
import { loadSchema, validateTheme } from './validate-schema.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(root, 'tokens');
const outDir = join(root, 'build', 'portfolio');
const tmpDir = join(root, 'build', '.tmp');

const MODES = ['light', 'dark'];

registerTransforms();

const schema = loadSchema(join(tokensDir, 'semantic/portfolio/_schema.json'));
const baseTheme = schema.baseTheme;

const themes = readdirSync(join(tokensDir, 'semantic/portfolio/themes'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

if (!themes.includes(baseTheme)) {
  throw new Error(`Base theme "${baseTheme}" from _schema.json has no folder under themes/`);
}

const primitiveSources = [join(tokensDir, 'primitives/*.json')];
const componentSources = [join(tokensDir, 'component/portfolio/*.json')];

const semanticSources = (theme, mode) => {
  const file = (s, m) => join(tokensDir, `semantic/portfolio/themes/${s}/${m}.json`);
  // Base theme's light file is the floor every theme+mode deep-merges onto, which
  // is what makes typography/radii inheritance work without duplication.
  const layers = [file(baseTheme, 'light')];
  if (!(theme === baseTheme && mode === 'light')) layers.push(file(theme, mode));
  return layers;
};

/** Runs one Style Dictionary pass and returns the generated file contents. */
async function build({ name, source, filter, format }) {
  const destination = `${name}.out`;
  const sd = new StyleDictionary({
    source,
    log: { warnings: 'disabled', verbosity: 'silent' },
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: `${tmpDir}/`,
        files: [{ destination, filter, format }],
      },
    },
  });
  await sd.buildPlatform('css');
  const { readFileSync } = await import('node:fs');
  return readFileSync(join(tmpDir, destination), 'utf8');
}

rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const banner = `/**
 * GENERATED FILE — do not edit.
 * Source: tokens/  •  Build: npm run tokens
 *
 * Primitives are emitted once under :root. Semantic and component tokens are
 * emitted per theme+mode under [data-theme][data-mode], so components consume a
 * single stable custom-property name regardless of the active theme.
 */\n\n`;

const blocks = [];
const tokenIndex = {};

// --- Primitives: theme-independent, emitted once -----------------------------
const primitiveDecls = await build({
  name: 'primitives',
  source: primitiveSources,
  filter: 'confetti/primitives',
  format: 'confetti/css-declarations',
});
blocks.push(`:root {\n${primitiveDecls}\n}`);

// --- Semantic + component, per theme and mode ---------------------------------
for (const theme of themes) {
  for (const mode of MODES) {
    const source = [...primitiveSources, ...semanticSources(theme, mode), ...componentSources];

    const flat = JSON.parse(
      await build({
        name: `${theme}-${mode}-index`,
        source,
        filter: 'confetti/all',
        format: 'confetti/json-flat',
      })
    );

    validateTheme({ schema, theme, mode, builtNames: new Set(Object.keys(flat)) });

    const decls = await build({
      name: `${theme}-${mode}`,
      source,
      filter: 'confetti/themed',
      format: 'confetti/css-declarations',
    });

    blocks.push(`[data-theme="${theme}"][data-mode="${mode}"] {\n${decls}\n}`);
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

const base = tokenIndex[`${baseTheme}.light`];
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
// The interchange format Figma, Tokens Studio and most importers read. Values are
// fully resolved rather than aliased: a consumer that cannot run this build should
// still receive exact values instead of inferring them from the CSS.

/** Maps a flat token name to a DTCG `$type`. */
function dtcgType(name) {
  if (name.startsWith('color-')) return 'color';
  if (name.startsWith('space-') || name.startsWith('size-')) return 'dimension';
  if (name.startsWith('radius-')) return 'dimension';
  if (name.startsWith('border-width-')) return 'dimension';
  if (name.startsWith('font-family-')) return 'fontFamily';
  if (name.startsWith('font-size-')) return 'dimension';
  if (name.startsWith('font-weight-')) return 'fontWeight';
  if (name.startsWith('font-leading-') || name.startsWith('font-tracking-')) return 'number';
  if (name.startsWith('shadow-')) return 'shadow';
  if (name.startsWith('motion-duration-')) return 'duration';
  if (name.startsWith('motion-easing-')) return 'cubicBezier';
  return 'other';
}

/** Rebuilds `color-surface-page` into nested { color: { surface: { page: {...} } } }. */
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
    'Confetti design tokens, W3C DTCG format. One group per theme+mode; values are fully resolved.',
  ...Object.fromEntries(
    Object.entries(tokenIndex).map(([key, flat]) => [key.replace('.', '-'), nest(flat)])
  ),
};

writeFileSync(join(outDir, 'tokens.dtcg.json'), JSON.stringify(dtcg, null, 2) + '\n');

rmSync(tmpDir, { recursive: true, force: true });

console.log(
  `✓ tokens built — ${themes.length} theme(s) × ${MODES.length} modes` +
    `\n  ${themes.map((s) => `${s} (${MODES.join(', ')})`).join('\n  ')}` +
    `\n  → build/portfolio/tokens.css, tokens.json, tokens.dtcg.json, tailwind.theme.js`
);
