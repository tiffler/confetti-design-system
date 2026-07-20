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
    // Width is per-story so grid stories aren't squeezed into the single-card frame.
    (Story, ctx) => (
      <div style={{ maxWidth: (ctx.parameters.frameWidth as number | undefined) ?? 380 }}>
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
