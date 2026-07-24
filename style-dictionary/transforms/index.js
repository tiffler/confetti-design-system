import StyleDictionary from 'style-dictionary';

/** Doc keys like `$comment` sit alongside real token groups; never emit them. */
export const isDocKey = (token) => token.path.some((segment) => segment.startsWith('$'));
const real = (token) => !isDocKey(token);

/** Tokens under tokens/primitives/ — emitted once in :root. */
export const isPrimitive = (token) => token.filePath?.includes('/tokens/primitives/');

export function registerTransforms() {
  // ── Layer filters — each selects one input layer by file path, so the build
  //    can emit that layer into its own CSS selector (independent axes). ────────
  const byDir = (name, needle) =>
    StyleDictionary.registerFilter({
      name,
      filter: (token) => real(token) && Boolean(token.filePath?.includes(needle)),
    });

  byDir('confetti/primitives', '/tokens/primitives/');
  byDir('confetti/base', '/tokens/semantic/base');
  byDir('confetti/wiring', '/tokens/semantic/theme-roles');
  byDir('confetti/mode', '/tokens/modes/');
  byDir('confetti/theme', '/tokens/themes/');
  byDir('confetti/component', '/tokens/component/');
  byDir('confetti/override', '/tokens/overrides/');

  StyleDictionary.registerFilter({ name: 'confetti/all', filter: real });

  /**
   * CSS custom properties with RESOLVED values — for primitives, base, and the
   * per-axis mode/theme blocks (each self-contained, references the layer below).
   */
  StyleDictionary.registerFormat({
    name: 'confetti/css-declarations',
    format: ({ dictionary }) =>
      dictionary.allTokens
        .map((token) => `  --${token.name}: ${token.$value ?? token.value};`)
        .join('\n'),
  });

  /**
   * CSS custom properties as var() REFERENCES rather than resolved values — for
   * component tokens. This is what makes the two axes compose at runtime: a
   * component token like `--button-primary-bg: var(--color-action-primary-bg)`
   * resolves against whichever mode+theme is active on the element, so it is
   * emitted ONCE (not per combination). A token's reference path maps 1:1 to a
   * CSS var name (dots → hyphens); composite values (shadows) keep their literal
   * parts while each {ref} becomes a var().
   */
  StyleDictionary.registerFormat({
    name: 'confetti/css-declarations-refs',
    format: ({ dictionary }) =>
      dictionary.allTokens
        .map((token) => {
          const original =
            token.original?.$value ?? token.original?.value ?? token.$value ?? token.value;
          const withVars = String(original).replace(
            /\{([^}]+?)\}/g,
            (_, ref) => `var(--${ref.replace(/\./g, '-')})`
          );
          return `  --${token.name}: ${withVars};`;
        })
        .join('\n'),
  });

  /** Flat { tokenName: {value,path,comment} } JSON so Storybook reads tokens live. */
  StyleDictionary.registerFormat({
    name: 'confetti/json-flat',
    format: ({ dictionary }) =>
      JSON.stringify(
        Object.fromEntries(
          dictionary.allTokens.map((token) => [
            token.name,
            {
              value: token.$value ?? token.value,
              path: token.path,
              comment: token.comment ?? token.$description ?? null,
            },
          ])
        ),
        null,
        2
      ),
  });
}
