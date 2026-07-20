import type { Preview } from '@storybook/react';
import { ThemeProvider, SKINS, MODES, type Skin, type Mode } from '../src/theme/ThemeProvider';
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

  // Two independent toolbar axes, mirroring data-skin and data-mode.
  globalTypes: {
    skin: {
      description: 'Design system skin',
      toolbar: {
        title: 'Skin',
        icon: 'paintbrush',
        items: SKINS.map((skin) => ({ value: skin, title: skin })),
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
    skin: 'confetti',
    mode: 'light',
  },

  decorators: [
    (Story, context) => {
      const skin = context.globals.skin as Skin;
      const mode = context.globals.mode as Mode;

      return (
        <ThemeProvider skin={skin} mode={mode}>
          <div
            style={{
              background: 'var(--color-surface-page)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-body)',
              padding: 'var(--space-inset)',
              minHeight: '100vh',
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
