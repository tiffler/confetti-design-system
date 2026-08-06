import type { Preview } from '@storybook/react-vite';
// Loaded for its side effect only, and the order matters. Storybook's interactions
// loader replaces HTMLElement.prototype.focus with a getter that assumes `this` is an
// element; react-aria (inside Storybook's own docs UI) later reads that property off
// the prototype to save the original, which fires the getter with `this` bound to the
// prototype and throws "Illegal invocation". Rendering a story before opening a docs
// page is exactly that order, so the docs chunk is pulled in here at preview boot —
// react-aria then reads the pristine native focus and nothing throws.
import '@storybook/addon-docs/blocks';
import {
  ThemeProvider,
  THEMES,
  MODES,
  DEFAULT_THEME,
  DEFAULT_MODE,
  type Theme,
  type Mode,
} from '../src/theme/ThemeProvider';
import '../src/styles/global.css';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const MODE_ICON: Record<string, string> = { light: 'sun', dark: 'moon' };

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    options: {
      storySort: {
        // `Confetti` and `Tokens` are root-level components rather than folders, and
        // Storybook sorts those ahead of folders whatever this list says — so they are
        // listed first to describe where they actually land, not where we wish they did.
        order: [
          'Confetti',
          'Tokens',
          ['All tokens'],
          'Pages',
          'Foundations',
          ['Color', 'Typography', 'Spacing', 'Elevation'],
          'Components',
        ],
      },
    },
  },

  // Two independent toolbar switchers in the navbar, mirroring data-theme and data-mode.
  globalTypes: {
    theme: {
      description: 'Design system theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: THEMES.map((theme) => ({ value: theme, title: cap(theme), icon: 'circlehollow' })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Light or dark mode',
      toolbar: {
        title: 'Mode',
        icon: 'contrast',
        items: MODES.map((mode) => ({ value: mode, title: cap(mode), icon: MODE_ICON[mode] ?? 'circle' })),
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: DEFAULT_THEME,
    mode: DEFAULT_MODE,
  },

  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as Theme;
      const mode = context.globals.mode as Mode;

      // Filling the frame is right in the story canvas — it lets the page surface read
      // as the page. In docs each story is an inline block, so the same rule made every
      // embedded example a full viewport tall regardless of its content.
      const isDocs = context.viewMode === 'docs';

      return (
        <ThemeProvider theme={theme} mode={mode}>
          <div
            style={{
              background: 'var(--color-surface-page)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-body)',
              padding: 'var(--space-inset)',
              minHeight: isDocs ? undefined : '100vh',
              boxSizing: 'border-box',
            }}
          >
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
