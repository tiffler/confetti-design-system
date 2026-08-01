import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { XIcon as X } from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Overlay } from './Overlay';

const meta = {
  title: 'Components/Overlay',
  component: Overlay,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The full-viewport dim that above-the-page surfaces sit on — and the only place in the system where dialog behaviour is implemented.\n\nIt is a native `<dialog>` opened with `showModal()`, which is the reason it exists: the platform supplies a real focus trap, `inert` on everything behind it, Escape handling, and the top layer, so the content can never be clipped or out-stacked by an ancestor and needs no z-index. Hand-rolled overlays get some of that and quietly miss the rest — usually the focus trap and `inert`.\n\nThe element **is** the scrim, so a click that misses the content lands on it and dismisses. It paints no fill, border or radius: whatever you place on it brings its own.\n\n**`Modal` is this plus a Card-weight panel.** Reach for Overlay directly when the thing on the scrim is not a panel — an image viewer, a sheet, a menu.',
      },
    },
  },
  argTypes: {
    open: { control: false, description: 'Controlled — every story drives it from a trigger.' },
    onClose: { control: false },
    label: { control: 'text', description: 'Accessible name. Use this or `labelledBy`.' },
    labelledBy: { control: false, description: 'Id of an element that names the overlay.' },
    placement: { control: 'inline-radio', options: ['center', 'bottom'] },
    dismissOnScrimClick: { control: 'boolean' },
  },
  args: { open: false, onClose: () => {}, label: 'Example overlay', children: null },
} satisfies Meta<typeof Overlay>;

export default meta;
type Story = StoryObj<typeof Overlay>;

/** A bare surface to put on the scrim, so the stories are about Overlay and not about chrome. */
function Panel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        maxWidth: 420,
        display: 'grid',
        gap: 'var(--space-stack)',
        padding: 'var(--space-inset)',
        background: 'var(--color-surface-card)',
        color: 'var(--color-text-primary)',
        border: 'var(--border-width-default) solid var(--color-border-default)',
        borderRadius: 'var(--radius-container)',
        boxShadow: 'var(--shadow-lift)',
        fontFamily: 'var(--font-family-body)',
      }}
    >
      {children}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open overlay
        </Button>
        <Overlay open={open} onClose={() => setOpen(false)} label="Example overlay">
          <Panel onClose={() => setOpen(false)}>
            <p style={{ margin: 0 }}>
              Try every way out: <strong>Escape</strong>, or a click on the dim. Tab is trapped in
              here while it is open, and focus returns to the trigger when it closes — all of that
              is <code>showModal()</code>, not component code.
            </p>
          </Panel>
        </Overlay>
      </>
    );
  },
};

export const Bottom: Story = {
  name: 'Sheet placement',
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open sheet
        </Button>
        <Overlay open={open} onClose={() => setOpen(false)} label="Example sheet" placement="bottom">
          <Panel onClose={() => setOpen(false)}>
            <p style={{ margin: 0 }}>
              `placement="bottom"` is the mobile-sheet position. The viewport padding still applies,
              so a tall sheet grows upward into the scroll area rather than off-screen.
            </p>
          </Panel>
        </Overlay>
      </>
    );
  },
};

export const NoScrimDismiss: Story = {
  name: 'Scrim click disabled',
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete project
        </Button>
        <Overlay
          open={open}
          onClose={() => setOpen(false)}
          label="Confirm deletion"
          dismissOnScrimClick={false}
        >
          <Panel onClose={() => setOpen(false)}>
            <p style={{ margin: 0 }}>
              A stray click outside should not throw away a destructive decision, so the scrim is
              inert here. Escape still works — never remove every exit.
            </p>
          </Panel>
        </Overlay>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `dismissOnScrimClick={false}` for a flow where an accidental click outside would lose work. Escape deliberately keeps working: a surface with no keyboard exit is a trap.',
      },
    },
  },
};

export const AsImageViewer: Story = {
  name: 'As an image viewer',
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open viewer
        </Button>
        <Overlay open={open} onClose={() => setOpen(false)} label="Image preview">
          <figure style={{ margin: 0, display: 'grid', gap: 'var(--space-stack)', justifyItems: 'center' }}>
            <div
              style={{
                width: 'min(560px, 80vw)',
                aspectRatio: '3 / 2',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--color-accent-purple-subtle)',
                color: 'var(--color-accent-on-subtle)',
                borderRadius: 'var(--radius-container)',
                fontFamily: 'var(--font-family-label)',
                fontSize: 'var(--font-size-label)',
                letterSpacing: 'var(--font-tracking-label)',
                textTransform: 'uppercase',
              }}
            >
              Stand-in for an image
            </div>
            {/* No colour of its own: it inherits `--color-on-scrim` from the Overlay. */}
            <figcaption
              style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--font-size-label)' }}
            >
              Bare content on the scrim inherits the on-scrim foreground.
            </figcaption>
          </figure>

          {/* A bare control, not a ghost Button: Button's variants are coloured for a page
              surface, and ghost's ink would disappear into the scrim in light mode. */}
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 'var(--space-inset) var(--space-inset) auto auto',
              display: 'grid',
              placeItems: 'center',
              width: 'var(--size-control)',
              height: 'var(--size-control)',
              color: 'inherit',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
            }}
          >
            <Icon icon={X} size="md" />
          </button>
        </Overlay>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'The case the portfolio hand-rolls four times over — lightbox, gallery viewer, mobile nav, and the table-of-contents sheet each re-implement portal + scrim + Escape + scroll lock. All four are this component with different content on top.\n\nNote what the caption and the close control do **not** do: set a colour. The scrim is deep in both modes, so its foreground is fixed too (`--color-on-scrim`), and Overlay sets it on the scrim for anything placed straight onto it to inherit. That is also why the close control here is a bare button rather than a ghost `Button` — Button\'s variants are coloured for a page surface, and ghost ink would disappear into the scrim in light mode. Content that brings its own surface, like Modal\'s panel, overrides the inherited colour with its own.',
      },
    },
  },
};
