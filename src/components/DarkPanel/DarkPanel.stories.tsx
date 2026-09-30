import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowUpRight, EnvelopeSimple, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';
import { DarkPanel } from './DarkPanel';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';

const meta = {
  title: 'Components/DarkPanel',
  component: DarkPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A deep, rounded call-to-action block. It stays dark in light *and* dark mode (`surface.deep`), so it works as a contrast moment at the end of a page. Put supporting copy or icons in the body and `<Button>`s in `actions`.\n\nEvery Button variant reads on it: the panel repoints the secondary and ghost variants and the focus ring to the light-on-deep pair, so nothing inside needs restyling.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    titleAs: {
      control: 'inline-radio',
      options: ['h2', 'h3', 'h4'],
      description: 'Heading level, so the panel fits the page outline.',
      table: { defaultValue: { summary: 'h2' } },
    },
  },
  args: { title: "Let's make something." },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DarkPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actions: (
      <Button variant="primary">
        Say hello <Icon icon={ArrowUpRight} size="sm" />
      </Button>
    ),
  },
};

export const WithIcons: Story = {
  name: 'With icons',
  args: {
    children: (
      <div style={{ display: 'flex', gap: 'var(--space-inline)' }}>
        <Icon icon={GithubLogo} size="lg" />
        <Icon icon={LinkedinLogo} size="lg" />
        <Icon icon={EnvelopeSimple} size="lg" />
      </div>
    ),
    actions: <Button variant="primary">Say hello</Button>,
  },
};

export const AllButtonVariants: Story = {
  name: 'All button variants',
  parameters: {
    docs: {
      description: {
        story: 'Each Button variant on the deep ground — the check that nothing disappears.',
      },
    },
  },
  args: {
    children: 'Available for new projects from October.',
    actions: (
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </>
    ),
  },
};
