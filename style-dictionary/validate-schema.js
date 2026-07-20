import { readFileSync } from 'node:fs';

export function loadSchema(schemaPath) {
  return JSON.parse(readFileSync(schemaPath, 'utf8'));
}

/** `color` + `action.ghost.fg-hover` -> `color-action-ghost-fg-hover` */
const tokenName = (group, path) => [group, ...path.split('.')].join('-');

/**
 * Enforces tokens/semantic/portfolio/_schema.json against a built skin+mode.
 *
 * `required` tokens must be defined by the skin itself. `inheritable` tokens
 * may be omitted by a skin — they deep-merge from the base skin's light file —
 * so for those we only assert the merge produced a value, which is what
 * guarantees the base skin stays complete.
 */
export function validateSkin({ schema, skin, mode, builtNames }) {
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
          `unresolved inheritable token  ${group}.${path}  — the base skin ` +
            `"${schema.baseSkin}" must define it`
        );
      }
    }
  }

  if (errors.length) {
    throw new Error(
      `Semantic schema violations in skin "${skin}" (${mode} mode):\n` +
        errors.map((e) => `  • ${e}`).join('\n')
    );
  }
}
