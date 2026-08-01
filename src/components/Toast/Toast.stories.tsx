import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowCounterClockwiseIcon as ArrowCounterClockwise } from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Toast, type ToastTone } from './Toast';

const TONES: ToastTone[] = ['success', 'danger', 'neutral'];

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A transient notification. Card-weight paper — raised surface, sticker border, hard offset shadow — with the tone carried by the leading edge and the icon rather than by a coloured fill.\n\nThat is the main design decision here. A solid green or red panel would drag every foreground inside it onto a second set of tokens, and the dismiss control would stop matching every other ghost button in the system. Colouring the edge keeps the interior an ordinary surface, so `text.primary`, `text.muted` and `Button ghost` all behave exactly as they do everywhere else — and the tone still reads from across the room.\n\n**What it does not do:** position itself, or manage a queue or timer. Those belong to the application, the same way `Modal` leaves `open` to the parent. Render it inside whatever fixed container your app uses.\n\n**What it does do:** announce itself correctly. `danger` takes `role="alert"` (assertive — it interrupts what a screen reader is saying); everything else takes `role="status"` (polite — it waits for a pause). The icon is decorative, because the title already carries the meaning as text.',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: TONES,
      description: 'What the toast is telling you. Drives the edge, the icon, and the ARIA role.',
      table: { defaultValue: { summary: 'neutral' } },
    },
    title: { control: 'text', description: 'Short outcome line. A few words.' },
    children: { control: 'text', description: 'Optional second line with the detail.' },
    onDismiss: { control: false, description: 'Omit to render a toast that cannot be dismissed.' },
    action: { control: false, description: 'A single control. More than one belongs in a dialog.' },
  },
  args: {
    tone: 'success',
    title: 'Changes saved',
    children: 'Your tokens were rebuilt and published to the design library.',
  },
  render: (args) => <Toast {...args} onDismiss={() => {}} />,
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The success green from `status.success` — the same colour a `<Badge hue="success">` uses, one layer up.',
      },
    },
  },
};

export const Danger: Story = {
  args: {
    tone: 'danger',
    title: "Couldn't publish",
    children: 'The token build failed a contrast check. Nothing was written.',
  },
  parameters: {
    docs: {
      description: {
        story: 'The only tone that takes `role="alert"`, because it is the only one worth interrupting for.',
      },
    },
  },
};

export const Neutral: Story = {
  args: {
    tone: 'neutral',
    title: 'Build queued',
    children: 'You are third in line. This usually takes under a minute.',
  },
};

export const WithAction: Story = {
  name: 'With an action',
  args: {
    tone: 'neutral',
    title: 'Project archived',
    children: 'It will stop appearing in search straight away.',
    action: (
      <Button variant="secondary">
        <Icon icon={ArrowCounterClockwise} size="sm" /> Undo
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'One control, and only one. A toast that needs two decisions is a dialog that has not admitted it yet.',
      },
    },
  },
};

export const TitleOnly: Story = {
  name: 'Title only',
  args: { tone: 'success', title: 'Copied to clipboard', children: undefined },
  parameters: {
    docs: { description: { story: 'The body is optional — most toasts do not need one.' } },
  },
};

export const NotDismissible: Story = {
  name: 'Not dismissible',
  args: { tone: 'neutral', title: 'Reconnecting…', children: 'Retrying every few seconds.' },
  render: (args) => <Toast {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'Omitting `onDismiss` drops the close control — for a toast on a timer, or one describing a state the user cannot dismiss their way out of.',
      },
    },
  },
};

export const AllTones: Story = {
  name: 'All tones',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack)', justifyItems: 'start' }}>
      <Toast tone="success" title="Changes saved" onDismiss={() => {}}>
        Your tokens were rebuilt and published to the design library.
      </Toast>
      <Toast tone="danger" title="Couldn't publish" onDismiss={() => {}}>
        The token build failed a contrast check. Nothing was written.
      </Toast>
      <Toast tone="neutral" title="Build queued" onDismiss={() => {}}>
        You are third in line. This usually takes under a minute.
      </Toast>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Stacked the way an app would render them. The system supplies the toast; the spacing and the fixed container are the app’s.',
      },
    },
  },
};

/** Proves the thing a static story cannot: that it mounts, announces, and goes away. */
export const Live: Story = {
  name: 'Live (interactive)',
  render: function LiveToast() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 'var(--space-stack)', justifyItems: 'start' }}>
        <Button variant="primary" onClick={() => setOpen(true)} disabled={open}>
          Save changes
        </Button>
        {open && (
          <Toast tone="success" title="Changes saved" onDismiss={() => setOpen(false)}>
            Dismiss it, then trigger it again — it is mounted and unmounted, not hidden.
          </Toast>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A toast should be mounted when it appears and unmounted when it goes, not hidden with CSS — a hidden-but-present `role="status"` node re-announces at unpredictable moments.',
      },
    },
  },
};
