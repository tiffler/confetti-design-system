import type { Meta, StoryObj } from '@storybook/react';
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
          'Mono uppercase pill across the four accent hues. `bold` uses the saturated end of each hue pair, `subtle` the tint end — and the foreground token differs between them so both stay legible in dark mode.',
      },
    },
  },
  argTypes: {
    hue: { control: 'inline-radio', options: HUES },
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

export const Default: Story = {};

export const Bold: Story = {
  name: 'Bold — all hues',
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
