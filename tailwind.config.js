import theme from './build/portfolio/tailwind.theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,mdx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    // Generated from tokens/ — every value is a var() reference, so utilities
    // follow whatever theme+mode is active at runtime.
    extend: theme,
  },
  plugins: [],
};
