import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { Modal, type ModalSize } from './Modal';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A dialog built on the native `<dialog>` element, opened with `showModal()` — so the focus trap, `inert` on the page behind, Escape handling, and the top layer all come from the platform rather than from component code. The panel is **Card-weight**: same fill, 2px sticker border, container radius, and hard offset shadow, held at rest. The dim is `--color-scrim`, the one axis-independent color role in the system (identical in every theme × mode) and this is its only consumer. Fully controlled — Escape, the close button, and a click on the scrim all route through `onClose`, and the parent decides.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  // Defaults so the required props are typed; every story drives `open` via `render`.
  args: {
    open: false,
    onClose: () => {},
    title: 'Publish this case study?',
    size: 'md',
    children: 'It goes live at tienmedia.com straight away. You can unpublish at any time.',
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story needs a trigger and a piece of state — this supplies both. */
function Demo({
  size = 'md',
  title = 'Publish this case study?',
  trigger = 'Publish',
  children = 'It goes live at tienmedia.com straight away. You can unpublish at any time.',
  footer,
}: {
  size?: ModalSize;
  title?: string;
  trigger?: string;
  children?: ReactNode;
  footer?: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <Modal
        open={open}
        onClose={close}
        title={title}
        size={size}
        footer={
          footer?.(close) ?? (
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" onClick={close}>
                Publish
              </Button>
            </>
          )
        }
      >
        {children}
      </Modal>
    </>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Open it, then try every way out: **Escape**, the close button, or a click on the dim. Tab is trapped inside the panel while it is open, and focus returns to the trigger when it closes — all of that is `showModal()`, not component code.\n\nWorth flipping to **dark**: the scrim is a fixed deep ink in *both* modes, so the panel’s edge behaves differently in each. In dark, `--modal-border-color` and `--modal-shadow` resolve to cream and the full sticker treatment reads against the dim. In light they resolve to ink — ink on ink — so the outline and the offset shadow are painted but invisible, and the white panel’s own silhouette is the edge. That is the tokens repointing per mode exactly as designed, not a missing border: on a deep scrim there is no light page to separate the panel from.',
      },
    },
  },
  render: () => <Demo />,
};

export const Sizes: Story = {
  name: 'Two widths',
  parameters: {
    docs: {
      description: {
        story:
          '`sm` (420px) is for a confirmation — a question and two buttons. `md` (560px) is the default, sized for a paragraph or two. Both cap the panel’s `max-width`; below that it fills the viewport minus `--modal-viewport-padding`, so the small end needs no separate mobile treatment.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-inline)', flexWrap: 'wrap' }}>
      <Demo
        size="sm"
        trigger="Small — confirm"
        title="Delete this draft?"
        footer={(close) => (
          <>
            <Button variant="ghost" onClick={close}>
              Keep
            </Button>
            <Button variant="primary" onClick={close}>
              Delete
            </Button>
          </>
        )}
      >
        This cannot be undone.
      </Demo>
      <Demo size="md" trigger="Medium — default" />
    </div>
  ),
};

export const RichContent: Story = {
  name: 'With content',
  parameters: {
    docs: {
      description: {
        story:
          'The body takes arbitrary children — here a pair of Badges above the copy. Header, body, and footer are separated by `--modal-gap`, and footer actions are end-aligned so the primary lands under the reader’s thumb.',
      },
    },
  },
  render: () => (
    <Demo
      title="Confetti v0.3.0"
      trigger="What’s new"
      footer={(close) => (
        <Button variant="primary" onClick={close}>
          Got it
        </Button>
      )}
    >
      <div style={{ display: 'grid', gap: 'var(--space-stack)', justifyItems: 'start' }}>
        <div style={{ display: 'flex', gap: 'var(--space-inline)' }}>
          <Badge hue="teal" tone="bold">
            New
          </Badge>
          <Badge hue="purple" tone="subtle">
            Modal
          </Badge>
        </div>
        <p style={{ margin: 0 }}>
          The system is now six components. Modal is the first to consume{' '}
          <code>--color-scrim</code>, the fixed dim added in v0.2.1 — the same value in all
          six theme × mode combinations, because a scrim that shifted with the theme would
          read as a different depth each time.
        </p>
      </div>
    </Demo>
  ),
};

export const OnAnAppFrame: Story = {
  name: 'Over an app frame',
  parameters: {
    docs: {
      description: {
        story:
          'The other v0.2.1 surface, `--color-surface-backdrop`, in its intended role: the recessed mat a step *below* page that an app frame sits on. It gives the scrim something with real depth to dim — worth checking in dark mode, where backdrop is the deepest ink and the scrim still has to separate the panel from it.',
      },
    },
  },
  render: () => (
    <div
      style={{
        background: 'var(--color-surface-backdrop)',
        padding: 'var(--space-layout-sm)',
        borderRadius: 'var(--radius-container)',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface-raised)',
          color: 'var(--color-text-primary)',
          border: 'var(--border-width-default) solid var(--color-border-default)',
          borderRadius: 'var(--radius-container)',
          padding: 'var(--space-inset)',
          display: 'grid',
          gap: 'var(--space-stack)',
          justifyItems: 'start',
        }}
      >
        <h3 style={{ margin: 0, fontFamily: 'var(--font-family-display)' }}>Drafts</h3>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Three case studies waiting on review.
        </p>
        <Demo />
      </div>
    </div>
  ),
};
