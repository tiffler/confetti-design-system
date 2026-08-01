import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A value chosen by dragging along a rail — volume, a threshold, a rating.\n\nThe knob is the focusable element and carries `role="slider"`, so assistive tech announces the **value** rather than "button", and the platform\'s slider shortcuts apply: **arrows** step, **Page Up/Down** jump ten steps, **Home/End** go to the ends.\n\nPointer and keyboard are equal citizens, which is the part hand-rolled sliders usually miss — a drag-only control is unusable without a mouse. Dragging uses pointer capture, so the value keeps tracking when your pointer wanders off the rail mid-gesture.\n\nThe rail is 12px, but the row is `size.control` (48px) tall: the rail is the graphic, the row is the target. That is what keeps a thin rail comfortable to grab without drawing a fat bar.',
      },
    },
  },
  argTypes: {
    value: { control: false, description: 'Controlled — the parent owns the value.' },
    onChange: { control: false },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number', description: 'Granularity of every change, keyboard included.' },
    children: { control: 'text', description: 'Visible label. Omit it and pass `aria-label`.' },
    showValue: { control: 'boolean' },
    formatValue: { control: false, description: 'Spoken instead of the bare number, and shown when `showValue` is on.' },
    disabled: { control: 'boolean' },
  },
  args: { value: 40, min: 0, max: 100, step: 1, children: 'Volume', onChange: () => {} },
  render: function Controlled(args) {
    const [v, setV] = useState(args.value);
    return <Slider {...args} value={v} onChange={setV} />;
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {};

export const WithValue: Story = {
  name: 'Showing the value',
  args: { showValue: true, formatValue: (v) => `${v}%` },
  parameters: {
    docs: {
      description: {
        story:
          '`formatValue` does double duty: it renders beside the rail **and** becomes `aria-valuetext`, so a screen reader says "40 percent" rather than "40". Use it whenever the bare number would not be self-explanatory.',
      },
    },
  },
};

export const Stepped: Story = {
  name: 'Coarse steps',
  args: { min: 0, max: 5, step: 1, value: 3, children: 'Rating', showValue: true, formatValue: (v) => `${v} of 5` },
  parameters: {
    docs: {
      description: {
        story:
          'A small range with whole-number steps. Dragging snaps to the nearest step rather than landing between them, and the arrow keys move exactly one.',
      },
    },
  },
};

export const Fractional: Story = {
  name: 'Fractional steps',
  args: { min: 0, max: 2, step: 0.25, value: 1, children: 'Rate', showValue: true, formatValue: (v) => `${v}×` },
  parameters: {
    docs: {
      description: {
        story:
          'Steps below 1 are rounded to the step\'s own precision, so repeated keying lands on `0.75` rather than `0.7500000000000001`.',
      },
    },
  },
};

export const NoLabel: Story = {
  name: 'Without a visible label',
  args: { children: undefined, 'aria-label': 'Volume' },
  parameters: {
    docs: {
      description: {
        story:
          'For a toolbar or a dense row. `aria-label` becomes required — a slider with no accessible name announces as a bare value with no indication of what it controls.',
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true, showValue: true },
};

export const Ends: Story = {
  name: 'At both ends',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack)', minWidth: 320 }}>
      <Slider value={0} onChange={() => {}} showValue>
        Empty
      </Slider>
      <Slider value={50} onChange={() => {}} showValue>
        Half
      </Slider>
      <Slider value={100} onChange={() => {}} showValue>
        Full
      </Slider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Pinned, for a snapshot. The knob centres on its value at both extremes rather than overhanging the rail, which is what the half-width offset in the CSS is for.',
      },
    },
  },
};
