import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight } from '@phosphor-icons/react';
import { Button, type ButtonProps } from './Button';
import { Icon } from '../Icon/Icon';

/** The interaction states Button has a visual for. `rest` is the default. */
const STATES = ['rest', 'hover', 'focus', 'pressed'] as const;
type ButtonState = (typeof STATES)[number];

const VARIANTS = ['primary', 'secondary', 'ghost'] as const;

/**
 * Story args add two knobs that are not component props: `state` pins an interaction
 * state, and `iconOnly` swaps the label for an icon. Both are docs affordances — see
 * `forceState` below and the `data-force` note in Button.css.
 */
type ButtonStoryArgs = ButtonProps & {
  state: ButtonState;
  iconOnly: boolean;
};

/**
 * `data-force` is a docs-only CSS hook, deliberately kept out of the public props type.
 * Returned as a loose record so it can be spread without widening `ButtonProps`.
 */
const forceState = (state: ButtonState): Record<string, string> =>
  state === 'rest' ? {} : { 'data-force': state };

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Three variants sharing one footprint. Primary and secondary lift onto a hard ink shadow on hover; ghost only shifts its text to red. Pressed is the inverse of hover — the sticker settles back down — so it resolves to the resting values in every theme. All values come from `--button-*` component tokens.\n\nUse the **state** control to pin hover, focus, or pressed: the CSS pairs each real pseudo-class with a `data-force` attribute, which is what lets a state be held still for a control or a snapshot.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: VARIANTS,
      description: 'Primary = brand fill. Secondary = paper fill with ink border. Ghost = text only.',
      table: { defaultValue: { summary: 'primary' } },
    },
    state: {
      control: 'inline-radio',
      options: STATES,
      description: 'Docs-only. Pins an interaction state via `data-force` — not a component prop.',
      table: { category: 'Docs controls', defaultValue: { summary: 'rest' } },
    },
    iconOnly: {
      control: 'boolean',
      description: 'Docs-only. Renders an icon in place of the label, with an `aria-label`.',
      table: { category: 'Docs controls', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Dims to 45% and blocks the pointer. Hover and pressed are suppressed.',
      table: { defaultValue: { summary: 'false' } },
    },
    children: { control: 'text' },
  },
  args: {
    children: 'View case study',
    variant: 'primary',
    state: 'rest',
    iconOnly: false,
    disabled: false,
  },
  render: ({ state, iconOnly, children, ...args }) =>
    iconOnly ? (
      <Button {...args} {...forceState(state)} aria-label="Next case study">
        <Icon icon={ArrowRight} size="md" />
      </Button>
    ) : (
      <Button {...args} {...forceState(state)}>
        {children}
      </Button>
    ),
} satisfies Meta<ButtonStoryArgs>;

export default meta;
type Story = StoryObj<ButtonStoryArgs>;

export const Primary: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default. Every control above is live — flip **state**, **disabled**, or **iconOnly** to see each combination.',
      },
    },
  },
};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const AllVariants: Story = {
  name: 'All variants',
  parameters: {
    docs: { description: { story: 'Side by side — the footprint is identical across all three.' } },
  },
  render: ({ state }) => (
    <div style={{ display: 'flex', gap: 'var(--space-stack)', alignItems: 'center', flexWrap: 'wrap' }}>
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} {...forceState(state)}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  name: 'All states',
  parameters: {
    docs: {
      description: {
        story:
          'Every variant × every state, pinned. **Pressed reads the same as rest by design** — the button has settled back out of its hover lift, so it is flat again; the movement is what you feel, not a separate look. `disabled` is shown last because it suppresses hover and pressed entirely.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack-lg)' }}>
      {VARIANTS.map((variant) => (
        <div key={variant} style={{ display: 'grid', gap: 'var(--space-inline)' }}>
          <span
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--font-size-label)',
              letterSpacing: 'var(--font-tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            {variant}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-stack)', alignItems: 'center', flexWrap: 'wrap' }}>
            {STATES.map((state) => (
              <Button key={state} variant={variant} {...forceState(state)}>
                {state}
              </Button>
            ))}
            <Button variant={variant} disabled>
              disabled
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const IconOnly: Story = {
  name: 'Icon-only (labeled)',
  args: { iconOnly: true },
  parameters: {
    docs: {
      description: {
        story:
          'An icon-only button needs an accessible name — pass an `aria-label` to the `<Button>` (or a `label` to the `<Icon>`). In development, an icon-only button with neither logs a console warning so the a11y gap is caught early.',
      },
    },
  },
};
