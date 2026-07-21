import type { Meta, StoryObj } from '@storybook/react';
import {
  ArrowRight,
  BookOpen,
  DiamondsFour,
  Wrench,
  Sparkle,
  Image as ImageIcon,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { Icon } from './Icon';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Wraps [Phosphor](https://phosphoricons.com) rather than re-exporting it, so the system fixes the weight and routes sizing and colour through tokens. Pass the icon component itself — `icon={ArrowRight}` — so bundlers tree-shake to what you use.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['inherit', 'default', 'muted', 'accent'] },
    icon: { control: false },
  },
  args: {
    icon: ArrowRight,
    size: 'sm',
    tone: 'default',
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-inset)',
  flexWrap: 'wrap',
};

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Sizes mirror the type scale — 16 / 20 / 24px — so an icon matches the text it sits beside.',
      },
    },
  },
  render: (args) => (
    <div style={row}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <span key={size} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-inline)' }}>
          <Icon {...args} size={size} />
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>
            {size}
          </span>
        </span>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div style={row}>
      {(['default', 'muted', 'accent'] as const).map((tone) => (
        <span key={tone} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-inline)' }}>
          <Icon {...args} size="md" tone={tone} />
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>
            {tone}
          </span>
        </span>
      ))}
    </div>
  ),
};

export const InlineWithText: Story = {
  name: 'Inline with text',
  parameters: {
    docs: {
      description: {
        story:
          'With `tone="inherit"` (the default) the glyph uses `currentColor`, so it follows its context — including the ghost button’s red hover.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-stack)', alignItems: 'flex-start' }}>
      <p style={{ margin: 0, fontSize: 'var(--font-size-body)' }}>
        Body text with an <Icon icon={Sparkle} /> icon sitting on the baseline.
      </p>
      <Button variant="primary">
        View case study <Icon icon={ArrowRight} />
      </Button>
      <Button variant="ghost">
        Read more <Icon icon={ArrowRight} />
      </Button>
    </div>
  ),
};

export const InUse: Story = {
  name: 'The working set',
  parameters: {
    docs: {
      description: {
        story: 'The icons the portfolio actually uses — category filters, empty states, and copy affordances.',
      },
    },
  },
  render: () => (
    <div style={row}>
      {[
        { icon: BookOpen, label: 'Case studies' },
        { icon: DiamondsFour, label: 'Design systems' },
        { icon: Wrench, label: 'Tools' },
        { icon: Sparkle, label: 'Featured' },
        { icon: ImageIcon, label: 'Empty state' },
        { icon: Copy, label: 'Copy' },
        { icon: Check, label: 'Copied' },
      ].map(({ icon, label }) => (
        <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-inline)' }}>
          <Icon icon={icon} size="md" tone="default" />
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>
            {label}
          </span>
        </span>
      ))}
    </div>
  ),
};
