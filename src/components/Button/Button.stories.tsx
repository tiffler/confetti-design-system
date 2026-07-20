import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Three variants sharing one footprint. Primary and secondary lift onto a hard ink shadow on hover; ghost only shifts its text to red. All values come from `--button-*` component tokens.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost'],
    },
  },
  args: {
    children: 'View case study',
    variant: 'primary',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const AllVariants: Story = {
  name: 'All variants',
  parameters: {
    docs: {
      description: {
        story: 'Side by side — the footprint is identical across all three.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-stack)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};
