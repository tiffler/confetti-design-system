/**
 * Stylelint guards correctness, and the one design rule a linter can see: component CSS
 * reads tokens, never literals. (That it reads only COMPONENT tokens is checked by
 * style-dictionary/audit-css.js, which knows what the component tokens are.)
 */
export default {
  rules: {
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': [true, { ignore: ['consecutive-duplicates-with-different-values'] }],
    'declaration-block-no-shorthand-property-overrides': true,
    'font-family-no-duplicate-names': true,
    'function-calc-no-unspaced-operator': true,
    'keyframe-declaration-no-important': true,
    'no-descending-specificity': true,
    'no-duplicate-selectors': true,
    'no-invalid-position-at-import-rule': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'unit-no-unknown': true,
    // Named colours (`red`) are as much a literal as a hex value.
    'color-named': 'never',
  },
  overrides: [
    {
      // A component's colours come from its tokens. No hex literals.
      files: ['src/components/**/*.css'],
      rules: { 'color-no-hex': [true, { message: 'Component CSS reads tokens, not colour literals.' }] },
    },
  ],
};
