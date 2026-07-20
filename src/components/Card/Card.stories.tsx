import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Thick-outline container with an optional mono eyebrow and display-face title. `interactive` adds the same hover lift the buttons use.',
      },
    },
  },
  argTypes: {
    surface: { control: 'inline-radio', options: ['card', 'raised'] },
    interactive: { control: 'boolean' },
  },
  args: {
    eyebrow: 'Case study',
    title: 'Atlas',
    children: 'Rebuilding a research tool around the way analysts actually read.',
    surface: 'card',
    interactive: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  args: { interactive: true },
  parameters: {
    docs: { description: { story: 'Hover to see the lift and hard ink shadow.' } },
  },
};

export const RaisedSurface: Story = {
  name: 'Raised surface',
  args: { surface: 'raised' },
};

export const WithContent: Story = {
  name: 'With badges and action',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Card {...args} interactive>
      Rebuilding a research tool around the way analysts actually read.
      <div style={{ display: 'flex', gap: 'var(--space-inline)', marginTop: 'var(--space-stack)', flexWrap: 'wrap' }}>
        <Badge hue="teal">Product</Badge>
        <Badge hue="orange" tone="subtle">
          2025
        </Badge>
      </div>
      <div style={{ marginTop: 'var(--space-stack)' }}>
        <Button variant="ghost">Read more →</Button>
      </div>
    </Card>
  ),
};
