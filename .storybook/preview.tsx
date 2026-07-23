import type { Preview } from '@storybook/react-vite';
import { ThemeProvider, THEMES, MODES, type Theme, type Mode } from '../src/theme/ThemeProvider';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    options: {
      storySort: {
        order: ['Foundations', ['Color', 'Typography', 'Spacing', 'Elevation'], 'Components'],
      },
    },
  },

  // Two independent toolbar axes, mirroring data-theme and data-mode.
  globalTypes: {
    theme: {
      description: 'Design system theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: THEMES.map((theme) => ({ value: theme, title: theme })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Light or dark mode',
      toolbar: {
        title: 'Mode',
        icon: 'contrast',
        items: MODES.map((mode) => ({ value: mode, title: mode })),
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: 'confetti',
    mode: 'light',
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
