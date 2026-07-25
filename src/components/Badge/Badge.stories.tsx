import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const HUES = ['purple', 'teal', 'orange', 'pink'] as const;

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Mono uppercase pill across the four accent hues, plus a `neutral` hue for non-category labels (versions, counts). `bold` uses the saturated end of each hue pair, `subtle` the tint end — and the foreground token differs between them so both stay legible in dark mode. Badge is the source of truth for the pill palette: the Tabs active indicator reuses these exact `--badge-*` fill/border/radius tokens, so a badge and a lit tab read as one system per hue (see **Components/Tabs → Shares Badge’s palette**).',
      },
    },
  },
  argTypes: {
    hue: { control: 'inline-radio', options: [...HUES, 'neutral'] },
    tone: { control: 'inline-radio', options: ['bold', 'subtle'] },
  },
  args: {
    children: 'Product',
    hue: 'purple',
    tone: 'bold',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'One badge with the default args (purple, bold). Use the controls to try any hue × tone combination.',
      },
    },
  },
};

export const Bold: Story = {
  name: 'Bold — all hues',
  parameters: {
    docs: {
      description: {
        story:
          'The saturated end of each hue pair — a filled accent pill with an ink label. This is the category badge, and the same fill the Tabs active pill borrows.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-inline)', flexWrap: 'wrap' }}>
      {HUES.map((hue) => (
        <Badge {...args} key={hue} hue={hue} tone="bold">
          {hue}
        </Badge>
      ))}
    </div>
  ),
};

export const Subtle: Story = {
  name: 'Subtle — all hues',
  parameters: {
    docs: {
      description: {
        story:
          'The tint end of each hue pair — a pale fill with a matching deeper label, for a quieter tag. The foreground flips with the tint in dark mode so it stays legible.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-inline)', flexWrap: 'wrap' }}>
      {HUES.map((hue) => (
        <Badge {...args} key={hue} hue={hue} tone="subtle">
          {hue}
        </Badge>
      ))}
    </div>
  ),
};

export const Neutral: Story = {
  name: 'Neutral',
  parameters: {
    docs: {
      description: {
        story:
          'The non-category badge — a paper fill (`bold`) or a plain outline (`subtle`) in the neutral palette, for labels that aren’t one of the accent categories.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-inline)', alignItems: 'center' }}>
      <Badge {...args} hue="neutral" tone="bold">
        Bold
      </Badge>
      <Badge {...args} hue="neutral" tone="subtle">
        Subtle
      </Badge>
    </div>
  ),
};
