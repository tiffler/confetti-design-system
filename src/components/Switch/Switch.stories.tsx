import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, BellSlash, Eye, EyeSlash, Moon, Sun } from '@phosphor-icons/react';
import { Switch } from './Switch';
import { ModeToggle } from './ModeToggle';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A binary control that takes effect the moment you flip it — dark mode, a preference, a feature toggle. That immediacy is the whole distinction from a checkbox, which stages a value until something is submitted. If the change needs an **Apply**, it is a checkbox, not a switch.\n\nIt is a `role="switch"` button rather than a styled `<input type="checkbox">`, so assistive tech announces it as **on/off** instead of checked/unchecked — which is what the control actually means — and the track and thumb stay real elements to animate.\n\nThe two states differ in track fill, in thumb fill, **and** in which end the thumb sits at, so the state is never carried by colour alone.',
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean', description: 'Controlled — the parent owns the value.' },
    onChange: { control: false },
    children: { control: 'text', description: 'Visible label. Omit it and pass `aria-label` instead.' },
    iconOn: { control: false, description: 'Optional glyph carried on the thumb when on.' },
    iconOff: { control: false, description: 'And when off.' },
    disabled: { control: 'boolean' },
  },
  args: { checked: false, children: 'Dark mode', onChange: () => {} },
  render: function Controlled(args) {
    const [on, setOn] = useState(args.checked);
    return <Switch {...args} checked={on} onChange={setOn} />;
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { children: 'Email notifications' },
};

export const WithIcons: Story = {
  name: 'With icons',
  args: { children: 'Dark mode', iconOn: Moon, iconOff: Sun },
  parameters: {
    docs: {
      description: {
        story:
          'A glyph on the thumb gives the state a third signal beyond position and fill. It is decorative — the label is what names the control — so it never carries meaning on its own.',
      },
    },
  },
};

export const NoLabel: Story = {
  name: 'Without a visible label',
  args: { children: undefined, 'aria-label': 'Dark mode', iconOn: Moon, iconOff: Sun },
  parameters: {
    docs: {
      description: {
        story:
          'For a toolbar, where space is tight and the surrounding context carries the meaning. `aria-label` becomes required — a switch with no accessible name announces as "switch" and nothing else.',
      },
    },
  },
};

export const Disabled: Story = {
  args: { children: 'Not available on this plan', disabled: true },
};

export const States: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-stack)', justifyItems: 'start' }}>
      <Switch checked={false} onChange={() => {}} iconOff={Sun} iconOn={Moon}>
        Off
      </Switch>
      <Switch checked onChange={() => {}} iconOff={Sun} iconOn={Moon}>
        On
      </Switch>
      <Switch checked={false} onChange={() => {}} disabled>
        Off, disabled
      </Switch>
      <Switch checked onChange={() => {}} disabled>
        On, disabled
      </Switch>
    </div>
  ),
  parameters: { docs: { description: { story: 'Pinned, for a snapshot.' } } },
};

export const Several: Story = {
  name: 'A settings group',
  render: function Group() {
    const [prefs, setPrefs] = useState({ alerts: true, preview: false });
    return (
      <div style={{ display: 'grid', gap: 'var(--space-stack)', justifyItems: 'start' }}>
        <Switch
          checked={prefs.alerts}
          onChange={(v) => setPrefs((p) => ({ ...p, alerts: v }))}
          iconOn={Bell}
          iconOff={BellSlash}
        >
          Alerts
        </Switch>
        <Switch
          checked={prefs.preview}
          onChange={(v) => setPrefs((p) => ({ ...p, preview: v }))}
          iconOn={Eye}
          iconOff={EyeSlash}
        >
          Show previews
        </Switch>
      </div>
    );
  },
};

export const Mode: Story = {
  name: 'ModeToggle',
  render: () => <ModeToggle />,
  parameters: {
    docs: {
      description: {
        story:
          '`<ModeToggle />` is this Switch wired to `ThemeProvider` — the control the system was missing. `ThemeProvider` has always owned the mode and exposed `toggleMode()`, but shipped nothing to call it, so every consumer built its own.\n\nFlip it and the whole page re-skins. Note that in Storybook it competes with the **Mode** switcher in the toolbar: both write `data-mode`, and the toolbar wins on the next change, because the decorator passes its value down as a prop. In an app there is only one source of truth and no such fight.',
      },
    },
  },
};
