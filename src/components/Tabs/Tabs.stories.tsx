import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs, type TabItem } from './Tabs';
import { Badge } from '../Badge/Badge';

const CATEGORIES: TabItem[] = [
  { value: 'design', label: 'Design Systems', hue: 'purple' },
  { value: 'case', label: 'Case Studies', hue: 'teal' },
  { value: 'tools', label: 'Tools', hue: 'orange' },
  { value: 'writing', label: 'Writing', hue: 'pink' },
];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          'A segmented control — a pill group with a sliding active indicator. The active pill borrows Badge’s **palette and treatment** (the `--badge-*` fill, 1px subtle border, radius, ink label), so a lit tab and a Badge read as one system per hue — but a tab is a larger, comfortable control (roomy padding, readable mono label), matched to the portfolio’s About-page slider. Full keyboard support (arrows / Home / End, roving `tabindex`).',
      },
    },
  },
  // Defaults so the required props are typed; every story drives its own state via `render`.
  args: {
    tabs: CATEGORIES,
    value: CATEGORIES[0].value,
    onChange: () => {},
    'aria-label': 'Filter projects by category',
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ tabs = CATEGORIES, hue }: { tabs?: TabItem[]; hue?: TabItem['hue'] }) {
  const [value, setValue] = useState(tabs[0].value);
  const applied = hue ? tabs.map((t) => ({ ...t, hue })) : tabs;
  return <Tabs tabs={applied} value={value} onChange={setValue} aria-label="Filter projects by category" />;
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Four category tabs, purple active. Click or arrow-key between them — the pill slides and takes the active tab’s hue.',
      },
    },
  },
  render: () => <Demo />,
};

export const SharesBadgePalette: Story = {
  name: 'Shares Badge’s palette',
  parameters: {
    docs: {
      description: {
        story:
          'The bold Badges (top) and the slider (below) draw from one token set, so each accent reads the same across both — same fill, 1px subtle border, radius, ink mono label. The slider is the larger control; the Badge is the compact label.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack-lg)', justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 'var(--space-inline)', flexWrap: 'wrap' }}>
        {CATEGORIES.map((c) => (
          <Badge key={c.value} hue={c.hue} tone="bold">
            {c.label}
          </Badge>
        ))}
      </div>
      <Demo />
    </div>
  ),
};

export const PerHue: Story = {
  name: 'One control per accent',
  parameters: {
    docs: {
      description: {
        story: 'The active pill takes each tab’s `hue`, so a control can carry a single accent or mix them.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack)', justifyItems: 'start' }}>
      {(['purple', 'teal', 'orange', 'pink', 'neutral'] as const).map((hue) => (
        <Demo
          key={hue}
          hue={hue}
          tabs={[
            { value: 'one', label: 'Overview' },
            { value: 'two', label: 'Details' },
            { value: 'three', label: 'Activity' },
          ]}
        />
      ))}
    </div>
  ),
};
