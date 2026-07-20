import StyleDictionary from 'style-dictionary';

/** Tokens under tokens/primitives/ — emitted once in :root, not per skin+mode. */
export const isPrimitive = (token) => token.filePath?.includes('/tokens/primitives/');

/** Doc keys like `$comment` sit alongside real token groups; never emit them. */
export const isDocKey = (token) => token.path.some((segment) => segment.startsWith('$'));

export function registerTransforms() {
  StyleDictionary.registerFilter({
    name: 'confetti/primitives',
    filter: (token) => isPrimitive(token) && !isDocKey(token),
  });

  StyleDictionary.registerFilter({
    name: 'confetti/themed',
    filter: (token) => !isPrimitive(token) && !isDocKey(token),
  });

  StyleDictionary.registerFilter({
    name: 'confetti/all',
    filter: (token) => !isDocKey(token),
  });

  /**
   * CSS custom properties without the wrapping selector — the build script
   * composes the selectors itself so everything lands in one tokens.css.
   */
  StyleDictionary.registerFormat({
    name: 'confetti/css-declarations',
    format: ({ dictionary }) =>
      dictionary.allTokens
        .map((token) => `  --${token.name}: ${token.$value ?? token.value};`)
        .join('\n'),
  });

  /** Flat { tokenName: value } JSON so Storybook foundations read tokens live. */
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
