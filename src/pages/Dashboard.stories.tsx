import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowRightIcon as ArrowRight,
  ClockIcon as Clock,
  DownloadSimpleIcon as DownloadSimple,
  EyeIcon as Eye,
  GitBranchIcon as GitBranch,
  LightningIcon as Lightning,
  PlusIcon as Plus,
  TrendDownIcon as TrendDown,
  TrendUpIcon as TrendUp,
  UsersIcon as Users,
} from '@phosphor-icons/react';
import { Badge, type BadgeHue } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Icon, type PhosphorIcon } from '../components/Icon/Icon';
import { Modal } from '../components/Modal/Modal';
import { Tabs, type TabHue } from '../components/Tabs/Tabs';
import { Caption, Eyebrow, Figure, Grid, Lede, Page, Row, Rule, Stack, Text, Title } from './kit';

/**
 * An analytics dashboard — the densest of the example pages, and the one that shows the
 * components carrying real information rather than sitting in a specimen grid: stat tiles,
 * a segmented filter driving a live list, status badges, and a detail dialog.
 *
 * Everything is fake data and every value is a token, so the whole page re-skins from the
 * Theme and Mode switchers in the toolbar.
 */

type Status = 'shipped' | 'review' | 'blocked';

/* Status → the accent it borrows. Kept as one map so the badge in the list and the badge
   in the dialog can never drift apart. */
const STATUS: Record<Status, { label: string; hue: BadgeHue }> = {
  shipped: { label: 'Shipped', hue: 'teal' },
  review: { label: 'In review', hue: 'purple' },
  blocked: { label: 'Blocked', hue: 'orange' },
};

const STATS: Array<{
  label: string;
  value: string;
  delta: string;
  direction: 'up' | 'down';
  icon: PhosphorIcon;
}> = [
  { label: 'Active users', value: '12,480', delta: '8.2%', direction: 'up', icon: Users },
  { label: 'Sessions', value: '38,204', delta: '3.1%', direction: 'up', icon: Eye },
  { label: 'Avg. session', value: '4m 12s', delta: '0.4%', direction: 'down', icon: Clock },
  { label: 'Conversion', value: '3.9%', delta: '0.6%', direction: 'up', icon: Lightning },
];

type Activity = {
  id: string;
  title: string;
  branch: string;
  author: string;
  when: string;
  status: Status;
  summary: string;
};

const ACTIVITY: Activity[] = [
  {
    id: 'a1',
    title: 'Sticker shadow on card hover',
    branch: 'feat/card-lift',
    author: 'Priya',
    when: '12 minutes ago',
    status: 'shipped',
    summary:
      'The hard offset shadow now extrudes from the card border rather than the padding box, so the lift reads as one solid sticker instead of two stacked rectangles.',
  },
  {
    id: 'a2',
    title: 'Tabs indicator re-measures after webfonts land',
    branch: 'fix/tabs-indicator',
    author: 'Marco',
    when: '1 hour ago',
    status: 'shipped',
    summary:
      'The sliding pill measured against fallback metrics and settled a few pixels short. It now re-measures once document.fonts.ready resolves.',
  },
  {
    id: 'a3',
    title: 'Dark-mode contrast pass on accent tints',
    branch: 'feat/dark-accents',
    author: 'Priya',
    when: '3 hours ago',
    status: 'review',
    summary:
      'Every subtle tint deepens to the 700 step in dark mode so the light foreground clears AA on its own ground. Four pairs re-checked, all above 4.5:1.',
  },
  {
    id: 'a4',
    title: 'Modal returns focus to its trigger',
    branch: 'fix/modal-focus',
    author: 'Sam',
    when: '5 hours ago',
    status: 'review',
    summary:
      'Closing the dialog dropped focus to the body, so keyboard users landed at the top of the page. Focus now returns to the control that opened it.',
  },
  {
    id: 'a5',
    title: 'Token build fails on a cross-layer reference',
    branch: 'chore/layer-audit',
    author: 'Marco',
    when: 'Yesterday',
    status: 'blocked',
    summary:
      'The layer audit caught a component token pointing straight at a primitive. Blocked on deciding whether the missing semantic role is worth adding.',
  },
  {
    id: 'a6',
    title: 'Icon weight normalised to bold',
    branch: 'feat/icon-weight',
    author: 'Sam',
    when: 'Yesterday',
    status: 'shipped',
    summary:
      'Regular-weight glyphs read thin beside the 2px linework. Bold is now the system weight, with an escape hatch for the rare exception.',
  },
  {
    id: 'a7',
    title: 'Badge and Tabs share one pill recipe',
    branch: 'refactor/pill',
    author: 'Priya',
    when: '2 days ago',
    status: 'shipped',
    summary:
      'A lit tab and a bold Badge of the same hue now resolve to identical padding, radius and type — they consume the same --badge-* tokens.',
  },
  {
    id: 'a8',
    title: 'Storybook docs chrome ignores the active mode',
    branch: 'fix/docs-chrome',
    author: 'Marco',
    when: '2 days ago',
    status: 'blocked',
    summary:
      'The docs wrapper paints its own white background over the themed body. Waiting on a decision about how far to override third-party chrome.',
  },
];

/* `TabHue`, not `BadgeHue`: the two overlap but are not the same set — a tab is a category,
   so it has no `success`. The status badges above still use the Badge hues. */
const FILTERS: Array<{ value: 'all' | Status; label: string; hue: TabHue }> = [
  { value: 'all', label: 'All', hue: 'neutral' },
  { value: 'shipped', label: 'Shipped', hue: 'teal' },
  { value: 'review', label: 'In review', hue: 'purple' },
  { value: 'blocked', label: 'Blocked', hue: 'orange' },
];

function StatTile({ stat }: { stat: (typeof STATS)[number] }) {
  const up = stat.direction === 'up';
  return (
    <Card surface="raised" seed={stat.label}>
      <Row justify="space-between" align="flex-start" wrap={false}>
        <Eyebrow>{stat.label}</Eyebrow>
        <Icon icon={stat.icon} size="md" tone="muted" />
      </Row>
      <Figure>{stat.value}</Figure>
      <Row gap="var(--space-inline)">
        <Badge hue={up ? 'teal' : 'orange'} tone="subtle">
          <Icon icon={up ? TrendUp : TrendDown} size="sm" />
          <span style={{ marginInlineStart: 'var(--space-1)' }}>{stat.delta}</span>
        </Badge>
        <Caption>vs. last week</Caption>
      </Row>
    </Card>
  );
}

function ActivityRow({ item, onOpen }: { item: Activity; onOpen: () => void }) {
  const status = STATUS[item.status];
  return (
    <Row justify="space-between" align="flex-start" gap="var(--space-stack)">
      <Stack gap="var(--space-1)" style={{ minWidth: '18ch', flex: '1 1 24ch' }}>
        <Row gap="var(--space-inline)">
          <Text style={{ fontWeight: 'var(--font-weight-semibold)' }}>{item.title}</Text>
          <Badge hue={status.hue} tone="subtle">
            {status.label}
          </Badge>
        </Row>
        <Row gap="var(--space-2)">
          <Icon icon={GitBranch} size="sm" tone="muted" />
          <Caption>{item.branch}</Caption>
          <Caption aria-hidden>·</Caption>
          <Caption>
            {item.author} — {item.when}
          </Caption>
        </Row>
      </Stack>

      <Button variant="ghost" onClick={onOpen}>
        Details <Icon icon={ArrowRight} size="sm" />
      </Button>
    </Row>
  );
}

function Dashboard() {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [open, setOpen] = useState<Activity | null>(null);

  const visible = filter === 'all' ? ACTIVITY : ACTIVITY.filter((a) => a.status === filter);

  return (
    <Page>
      <Row justify="space-between" align="flex-end" gap="var(--space-stack)">
        <Stack gap="var(--space-2)">
          <Eyebrow>Workspace — Confetti</Eyebrow>
          <Title>Good morning, Tiffany</Title>
          <Lede>
            Eight changes landed this week, and two are waiting on you. Nothing is on fire.
          </Lede>
        </Stack>

        <Row gap="var(--space-inline)">
          <Button variant="secondary">
            <Icon icon={DownloadSimple} size="sm" /> Export
          </Button>
          <Button variant="primary">
            <Icon icon={Plus} size="sm" /> New report
          </Button>
        </Row>
      </Row>

      <Grid min={220}>
        {STATS.map((stat) => (
          <StatTile key={stat.label} stat={stat} />
        ))}
      </Grid>

      <Stack gap="var(--space-stack)">
        <Row justify="space-between" gap="var(--space-stack)">
          <Title as="h2" size="var(--font-size-h3)">
            Recent activity
          </Title>
          <Tabs
            aria-label="Filter activity by status"
            tabs={FILTERS}
            value={filter}
            onChange={(value) => setFilter(value as 'all' | Status)}
          />
        </Row>

        <Card surface="raised">
          {visible.length === 0 ? (
            <Text style={{ color: 'var(--color-text-muted)' }}>Nothing here right now.</Text>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-stack)' }}>
              {visible.map((item, i) => (
                <li key={item.id} style={{ display: 'grid', gap: 'var(--space-stack)' }}>
                  {i > 0 && <Rule />}
                  <ActivityRow item={item} onOpen={() => setOpen(item)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Stack>

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(null)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setOpen(null)}>
              Open in review
            </Button>
          </>
        }
      >
        {open && (
          <Stack gap="var(--space-stack)">
            <Row gap="var(--space-inline)">
              <Badge hue={STATUS[open.status].hue} tone="bold">
                {STATUS[open.status].label}
              </Badge>
              <Caption>
                {open.branch} — {open.author}, {open.when}
              </Caption>
            </Row>
            <Text style={{ color: 'var(--color-text-muted)' }}>{open.summary}</Text>
          </Stack>
        )}
      </Modal>
    </Page>
  );
}

const meta: Meta = {
  title: 'Pages/Dashboard',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
};
export default meta;

export const Default: StoryObj = {
  name: 'Dashboard',
  render: () => <Dashboard />,
};
