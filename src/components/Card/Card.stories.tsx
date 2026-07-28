import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, type CardProps } from './Card';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

/** Card only has a visual for hover, and only when `interactive`. */
const STATES = ['rest', 'hover'] as const;
type CardState = (typeof STATES)[number];

type CardStoryArgs = CardProps & { state: CardState };

/** Docs-only CSS hook — see the `data-force` note in Card.css. */
const forceState = (state: CardState): Record<string, string> =>
  state === 'rest' ? {} : { 'data-force': state };

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Thick-outline container with an optional mono eyebrow and display-face title. `interactive` adds the same hover lift the buttons use, plus a slight turn derived from `seed` — so a card always tilts the same way.\n\nThe **state** control pins hover via `data-force`; it only does anything while `interactive` is on, since a static card has no hover visual.',
      },
    },
  },
  argTypes: {
    surface: {
      control: 'inline-radio',
      options: ['card', 'raised'],
      description: '`raised` uses the paper-raised surface instead of the card interior.',
      table: { defaultValue: { summary: 'card' } },
    },
    interactive: {
      control: 'boolean',
      description: 'Adds the hover lift + hard shadow. Use for cards that link somewhere.',
      table: { defaultValue: { summary: 'false' } },
    },
    state: {
      control: 'inline-radio',
      options: STATES,
      description: 'Docs-only. Pins hover via `data-force` — requires `interactive`.',
      table: { category: 'Docs controls', defaultValue: { summary: 'rest' } },
    },
    tilt: {
      control: { type: 'range', min: -1, max: 1, step: 0.1 },
      description: 'Hover angle as a multiplier of `--card-tilt-max`, bypassing the seed. `0` stays square.',
    },
    seed: { control: 'text', description: 'String the hover angle is derived from. Defaults to `title`.' },
    eyebrow: { control: 'text' },
    title: { control: 'text' },
    children: { control: 'text' },
  },
  args: {
    eyebrow: 'Case study',
    title: 'Atlas',
    children: 'Rebuilding a research tool around the way analysts actually read.',
    surface: 'card',
    interactive: false,
    state: 'rest',
  },
  render: ({ state, ...args }) => <Card {...args} {...forceState(state)} />,
  decorators: [
    // Width is per-story so grid stories aren't squeezed into the single-card frame.
    (Story, ctx) => (
      <div style={{ maxWidth: (ctx.parameters.frameWidth as number | undefined) ?? 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<CardStoryArgs>;

export default meta;
type Story = StoryObj<CardStoryArgs>;

export const AllStates: Story = {
  name: 'All states',
  parameters: {
    frameWidth: 820,
    docs: {
      description: {
        story:
          'Both surfaces at rest and pinned to hover. Only `interactive` cards have a hover visual — a static card is identical in both columns, which is the point of the prop.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack-lg)' }}>
      {(['card', 'raised'] as const).map((surface) => (
        <div key={surface} style={{ display: 'grid', gap: 'var(--space-inline)' }}>
          <span
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--font-size-label)',
              letterSpacing: 'var(--font-tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            {surface}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-stack-lg)', flexWrap: 'wrap' }}>
            {STATES.map((state) => (
              <div key={state} style={{ maxWidth: 340 }}>
                <Card surface={surface} interactive title="Atlas" eyebrow={state} {...forceState(state)}>
                  Interactive card, {state}.
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

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

const WORK = [
  { title: 'Atlas', eyebrow: 'Design systems', body: 'A component library and token system built to bring six product teams onto one visual language.' },
  { title: 'Coldwater', eyebrow: 'Case studies', body: 'A checkout redesign that cut cart abandonment by simplifying shipping and payment into a single step.' },
  { title: 'Northline', eyebrow: 'Case studies', body: 'Reworked first-run onboarding to get new users to their first meaningful action in under a minute.' },
  { title: 'Meridian', eyebrow: 'Design systems', body: 'An accessible component set built from the ground up, documented for both design and engineering.' },
  { title: 'Marginalia', eyebrow: 'Tools', body: 'A personal sketchbook project exploring linework and hand lettering over one year.' },
  { title: 'Paper Trail', eyebrow: 'Tools', body: 'A set of editorial illustrations for a quarterly print zine on independent design practice.' },
];

export const TiltedGrid: Story = {
  name: 'Tilted grid',
  parameters: {
    frameWidth: 900,
    docs: {
      description: {
        story:
          'Cards sit square at rest and turn only on hover — hover any card to see it. Each derives its angle from its title, so neighbours turn different ways but a given card always turns the same way, even after filtering or re-sorting. Pass `tilt={0}` to lift without turning, or `tilt` in -1..1 to set the angle by hand.',
      },
    },
  },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 'var(--space-stack)',
      }}
    >
      {WORK.map((w) => (
        <Card key={w.title} {...args} eyebrow={w.eyebrow} title={w.title} interactive>
          {w.body}
        </Card>
      ))}
    </div>
  ),
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
