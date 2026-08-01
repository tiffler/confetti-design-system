import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { Tabs, type TabItem } from './Tabs';
import { Badge } from '../Badge/Badge';

/** The states an individual tab has a visual for. */
const STATES = ['rest', 'hover', 'focus', 'selected'] as const;
type TabState = (typeof STATES)[number];

/**
 * Pins a state on ONE tab inside a rendered group. Tabs owns its buttons, so rather than
 * widening the public API with a docs-only prop, the story reaches for the button through
 * a ref and sets the same `data-force` hook the CSS reads.
 */
function ForcedTabs({
  state,
  index = 1,
  tabs = CATEGORIES,
}: {
  state: TabState;
  index?: number;
  tabs?: TabItem[];
}) {
  const wrap = useRef<HTMLDivElement>(null);
  // `selected` is real state, not a forced one — drive it through `value`.
  const [value, setValue] = useState(state === 'selected' ? tabs[index].value : tabs[0].value);

  useEffect(() => {
    const buttons = wrap.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const target = buttons?.[index];
    if (!target) return;
    if (state === 'hover' || state === 'focus') target.setAttribute('data-force', state);
    return () => target.removeAttribute('data-force');
  }, [state, index]);

  return (
    <div ref={wrap}>
      <Tabs tabs={tabs} value={value} onChange={setValue} aria-label="Filter projects by category" />
    </div>
  );
}

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
  argTypes: {
    tabs: {
      control: 'object',
      description: 'The tab list. Each item takes a `value`, a `label`, and an optional `hue`.',
    },
    value: { control: false, description: 'The selected tab’s `value` (controlled).' },
    onChange: { control: false, description: 'Called with the newly selected `value`.' },
    'aria-label': { control: 'text', description: 'Accessible name for the tablist — required.' },
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

export const AllStates: Story = {
  name: 'All states',
  parameters: {
    docs: {
      description: {
        story:
          'The four states an individual tab can be in, each pinned on the **second** tab so it can be compared against its idle neighbours. `selected` is real state driven through `value`; `hover` and `focus` are pinned with `data-force`, since a control cannot trigger a pseudo-class.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack-lg)', justifyItems: 'start' }}>
      {STATES.map((state) => (
        <div key={state} style={{ display: 'grid', gap: 'var(--space-inline)', justifyItems: 'start' }}>
          <span
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--font-size-label)',
              letterSpacing: 'var(--font-tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            {state}
          </span>
          <ForcedTabs state={state} />
        </div>
      ))}
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

/**
 * Panels rendered outside the component. The three sections below are plain markup that Tabs
 * does not own — the equivalent of server-rendered HTML or an Astro island's static content.
 */
export const ExternalPanels: Story = {
  name: 'Panels rendered elsewhere',
  parameters: {
    docs: {
      description: {
        story:
          'Tabs does not render panels, because most consumers already have their content in React and only want the control. When the panels live elsewhere — server-rendered markup, an island, a sibling section — give each tab a `panelId`.\n\nThat alone wires `aria-controls`, and exposes each tab\'s generated `id` so a panel can point back with `aria-labelledby`. Add `managePanels` and Tabs will also show and hide them by toggling `hidden`.\n\nOne caveat worth knowing: `hidden` is `display: none`, so the panels do not reserve height and the page reflows when they differ in length. If that matters, leave `managePanels` off, keep `panelId` for the wiring, and drive visibility yourself — which is exactly what a no-reflow implementation does with a `visibility`-based attribute instead.',
      },
    },
  },
  render: function ExternalDemo() {
    const [value, setValue] = useState('brief');
    const tabs = [
      { value: 'brief', label: 'Brief', panelId: 'demo-panel-brief', hue: 'purple' as const },
      { value: 'process', label: 'Process', panelId: 'demo-panel-process', hue: 'purple' as const },
      { value: 'outcome', label: 'Outcome', panelId: 'demo-panel-outcome', hue: 'purple' as const },
    ];
    const panel = {
      fontFamily: 'var(--font-family-body)',
      fontSize: 'var(--font-size-body)',
      lineHeight: 'var(--font-leading-body)',
      color: 'var(--color-text-primary)',
      background: 'var(--color-surface-raised)',
      border: 'var(--border-width-default) solid var(--color-border-default)',
      borderRadius: 'var(--radius-container)',
      padding: 'var(--space-inset)',
      margin: 0,
    };

    return (
      <div style={{ display: 'grid', gap: 'var(--space-stack)', justifyItems: 'start' }}>
        <Tabs aria-label="Case study sections" tabs={tabs} value={value} onChange={setValue} managePanels />

        {/* Authored with the initial tab's panel visible and the rest already hidden — the
            effect that syncs them runs after paint, so the markup has to start correct. */}
        <p id="demo-panel-brief" role="tabpanel" style={panel}>
          The brief. This panel is ordinary markup outside the Tabs component; Tabs only knows its id.
        </p>
        <p id="demo-panel-process" role="tabpanel" style={panel} hidden>
          The process. Toggled by `managePanels`, and wired to its tab by `aria-controls`.
        </p>
        <p id="demo-panel-outcome" role="tabpanel" style={panel} hidden>
          The outcome. Inspect the tablist to see `aria-controls` pointing at each of these ids.
        </p>
      </div>
    );
  },
};
