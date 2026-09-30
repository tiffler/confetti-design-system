import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkCard, type WorkCardProps } from './WorkCard';

/** WorkCard only has a visual for hover, and only when it links somewhere (`href`). */
const STATES = ['rest', 'hover'] as const;
type WorkCardState = (typeof STATES)[number];

type WorkCardStoryArgs = WorkCardProps & { state: WorkCardState };

/** Docs-only CSS hook — see the `data-force` note in WorkCard.css. */
const forceState = (state: WorkCardState): Record<string, string> =>
  state === 'rest' ? {} : { 'data-force': state };

const meta = {
  title: 'Components/WorkCard',
  component: WorkCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An image-first project card: a framed media area with a category tag (top-left) and an index number (top-right), then the title and a date underneath. Pass an `<img>` as `media` and it is cropped to fill the frame; with none, the frame shows its own surface.\n\nGive it an `href` and it renders as a link with the hover lift; without one it is a plain `<article>`. The **state** control pins hover via `data-force`.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    meta: { control: 'text', description: 'The line beside the title — a date, a range, a year.' },
    index: { control: 'text', description: 'Sequence number over the top-right of the media.' },
    ratio: { control: 'text', description: 'Media aspect ratio (CSS `aspect-ratio`).', table: { defaultValue: { summary: '4 / 3' } } },
    href: { control: 'text', description: 'Renders a link and adds the hover lift.' },
    tag: { control: 'object', description: '`{ label, hue }` — hue is `purple`, `teal`, `orange` or `pink`.' },
    state: {
      control: 'inline-radio',
      options: STATES,
      description: 'Docs-only. Pins hover via `data-force` — requires `href`.',
      table: { category: 'Docs controls', defaultValue: { summary: 'rest' } },
    },
  },
  args: {
    title: 'Coldwater',
    meta: '2024',
    index: '02',
    tag: { label: 'Checkout redesign', hue: 'teal' },
    href: '#',
    state: 'rest',
  },
  render: ({ state, ...args }) => <WorkCard {...args} {...forceState(state)} />,
  decorators: [
    (Story, ctx) => (
      <div style={{ maxWidth: (ctx.parameters.frameWidth as number | undefined) ?? 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<WorkCardStoryArgs>;

export default meta;
type Story = StoryObj<WorkCardStoryArgs>;

export const Default: Story = {};

export const AllStates: Story = {
  name: 'All states',
  parameters: {
    frameWidth: 900,
    docs: {
      description: {
        story:
          'A linked card at rest and pinned to hover, beside a static card that has no hover visual.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-stack-lg)', flexWrap: 'wrap' }}>
      <div style={{ width: 280 }}>
        <WorkCard title="Meridian" meta="2021" index="03" tag={{ label: 'Component library', hue: 'purple' }} href="#" />
      </div>
      <div style={{ width: 280 }}>
        <WorkCard title="Meridian" meta="2021" index="03" tag={{ label: 'Component library', hue: 'purple' }} href="#" data-force="hover" />
      </div>
      <div style={{ width: 280 }}>
        <WorkCard title="Meridian" meta="2021" index="03" tag={{ label: 'Component library', hue: 'purple' }} />
      </div>
    </div>
  ),
};

export const TagHues: Story = {
  name: 'Tag hues',
  parameters: { frameWidth: 900 },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-stack)', flexWrap: 'wrap' }}>
      {(['purple', 'teal', 'orange', 'pink'] as const).map((hue) => (
        <div key={hue} style={{ width: 200 }}>
          <WorkCard title={hue} tag={{ label: 'Category', hue }} />
        </div>
      ))}
    </div>
  ),
};

const WORK = [
  { title: 'Coldwater', meta: '2024', tag: { label: 'Checkout redesign', hue: 'teal' as const } },
  { title: 'Meridian', meta: '2021', tag: { label: 'Component library', hue: 'purple' as const } },
  { title: 'Marginalia', meta: '2018–19', tag: { label: 'Sketchbook', hue: 'orange' as const } },
  { title: 'Harbor', meta: '2024', tag: { label: 'Field study', hue: 'pink' as const } },
];

export const Grid: Story = {
  parameters: {
    frameWidth: 1040,
    docs: {
      description: {
        story:
          'A wide featured card over a two-column grid. The featured card just uses a wider `ratio`.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack)' }}>
      <WorkCard
        title="Atlas"
        meta="2023–25"
        index="01"
        ratio="5 / 2"
        tag={{ label: 'Design system', hue: 'purple' }}
        href="#"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-stack)' }}>
        {WORK.map((w, i) => (
          <WorkCard key={w.title} {...w} index={`0${i + 2}`} ratio="16 / 9" href="#" />
        ))}
      </div>
    </div>
  ),
};
