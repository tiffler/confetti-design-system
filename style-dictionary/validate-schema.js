import { readFileSync } from 'node:fs';

export function loadSchema(schemaPath) {
  return JSON.parse(readFileSync(schemaPath, 'utf8'));
}

/** `color` + `action.ghost.fg-hover` -> `color-action-ghost-fg-hover` */
const tokenName = (group, path) => [group, ...path.split('.')].join('-');

/**
 * Enforces tokens/semantic/portfolio/_schema.json against a built theme+mode.
 *
 * `required` tokens must be defined by the theme itself. `inheritable` tokens
 * may be omitted by a theme — they deep-merge from the base theme's light file —
 * so for those we only assert the merge produced a value, which is what
 * guarantees the base theme stays complete.
 */
export function validateTheme({ schema, theme, mode, builtNames }) {
  const errors = [];

  for (const [group, paths] of Object.entries(schema.required ?? {})) {
    for (const path of paths) {
      if (!builtNames.has(tokenName(group, path))) {
        errors.push(`missing required token  ${group}.${path}`);
      }
    }
  }

  for (const [group, paths] of Object.entries(schema.inheritable ?? {})) {
    for (const path of paths) {
      if (!builtNames.has(tokenName(group, path))) {
        errors.push(
          `unresolved inheritable token  ${group}.${path}  — the base theme ` +
            `"${schema.baseTheme}" must define it`
        );
      }
    }
  }

  if (errors.length) {
    throw new Error(
      `Semantic schema violations in theme "${theme}" (${mode} mode):\n` +
        errors.map((e) => `  • ${e}`).join('\n')
    );
  }
}
