import { useState, type KeyboardEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowRightIcon as ArrowRight,
  ArrowUpRightIcon as ArrowUpRight,
  PathIcon as Path,
} from '@phosphor-icons/react';
import { Badge, type BadgeHue } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Icon } from '../components/Icon/Icon';
import { Modal } from '../components/Modal/Modal';
import { Tabs, type TabHue } from '../components/Tabs/Tabs';
import { Caption, Grid, Lede, Page, Row, Stack, Text, Title } from './kit';

/**
 * An index page — a hero, a working category filter, and a grid of interactive cards.
 * This is the page that shows the sticker hover at scale: each card's tilt is derived from
 * its title, so neighbours turn different ways and the angle survives a re-filter.
 *
 * The whole card is the control here, so there is deliberately no button nested inside it —
 * the "Read note" line is a plain affordance, and the card itself carries the role, tab stop
 * and keyboard handling.
 */

type Category = 'product' | 'systems' | 'motion' | 'writing';

const CATEGORY: Record<Category, { label: string; hue: BadgeHue }> = {
  product: { label: 'Product', hue: 'teal' },
  systems: { label: 'Systems', hue: 'purple' },
  motion: { label: 'Motion', hue: 'pink' },
  writing: { label: 'Writing', hue: 'orange' },
};

type Note = {
  id: string;
  title: string;
  category: Category;
  date: string;
  minutes: number;
  excerpt: string;
  body: string;
};

const NOTES: Note[] = [
  {
    id: 'n1',
    title: 'A token is a decision you only make once',
    category: 'systems',
    date: 'Jul 24',
    minutes: 6,
    excerpt:
      'Three layers — primitive, semantic, component — and one rule about which may reference which.',
    body: 'The layers are not bureaucracy; they are the thing that lets a demo re-skin an entire product by editing eight values. A primitive is a fact about paint. A semantic token is a decision about meaning. A component token is a decision about a part. When a component reaches past its layer to grab a primitive, the theme loses its grip on that part — and you find out six months later, in someone else\'s brand.',
  },
  {
    id: 'n2',
    title: 'Hover is a promise about what happens next',
    category: 'motion',
    date: 'Jul 19',
    minutes: 4,
    excerpt: 'The lift is not decoration. It is the control telling you it will accept a click.',
    body: 'Confetti lifts a filled button onto a hard offset shadow; Adventure brightens it in place; Neon lights it up. Each reads as the same promise because each is the same token repointed — and a theme added tomorrow gets to answer the question its own way without touching a component. Pressed is the inverse everywhere — the sticker settles back down — which is why it resolves to the resting values rather than to some separate look nobody designed.',
  },
  {
    id: 'n3',
    title: 'Contrast is a constraint, not a review step',
    category: 'systems',
    date: 'Jul 15',
    minutes: 8,
    excerpt: 'Brand red fails as text on the dark surface. The fix belongs in the tokens, not the review.',
    body: 'The brand red reads at 2.72:1 as text on the dark page — well under AA. Rather than asking every consumer to remember that, the dark override lifts brand-as-text to a lighter step and leaves the button fill alone, because a white label on that fill already passes at 6.27:1. The exception is written down, in the file, next to the value it changes.',
  },
  {
    id: 'n4',
    title: 'The component nobody asked for',
    category: 'product',
    date: 'Jul 11',
    minutes: 5,
    excerpt: 'Every system accumulates a component that exists because one screen needed it.',
    body: 'It usually arrives named after the screen it was built for, with four props that are really one prop and a comment apologising for the fifth. The honest move is to ask whether the screen was wrong. Most of the time it was, and deleting the component fixes the screen.',
  },
  {
    id: 'n5',
    title: 'Naming things after what they are for',
    category: 'writing',
    date: 'Jul 6',
    minutes: 3,
    excerpt: 'surface-raised, not cream-100. The second one is true and useless.',
    body: 'A name that describes the paint locks the value in place: rename the paint and every reference lies. A name that describes the job survives a re-skin, because the job does not change when the brand does. This is the entire argument for the semantic layer, and it fits in a sentence.',
  },
  {
    id: 'n6',
    title: 'Ship the dark mode with the light one',
    category: 'product',
    date: 'Jun 30',
    minutes: 7,
    excerpt: 'A dark mode added later is a second design system wearing the first one as a coat.',
    body: 'Retrofitting dark means auditing every hardcoded value in the product at once, under deadline, with no way to tell an intentional choice from an accident. Building both from the start costs one extra column in the token table and turns the whole question into a data problem.',
  },
  {
    id: 'n7',
    title: 'Focus rings are not negotiable',
    category: 'systems',
    date: 'Jun 22',
    minutes: 4,
    excerpt: 'Two pixels, a real outline, and never colour alone.',
    body: 'A focus state signalled only by a colour shift is invisible to a good portion of the people who depend on it most. The ring here is an outline with actual width, offset from the control, and it comes from the mode axis so it flips to cream on a dark page instead of vanishing into it.',
  },
  {
    id: 'n8',
    title: 'What a variant is allowed to change',
    category: 'product',
    date: 'Jun 14',
    minutes: 6,
    excerpt: 'Fill, yes. Footprint, no. A row of variants should measure the same.',
    body: 'Primary, secondary and ghost differ by fill and by nothing else — every one carries the border, transparent where the design has none, so all three occupy an identical box. The moment a variant changes its own height, every layout containing it acquires a special case.',
  },
  {
    id: 'n9',
    title: 'Write the comment that explains the exception',
    category: 'writing',
    date: 'Jun 8',
    minutes: 5,
    excerpt: 'The !important is fine. The undocumented !important is the problem.',
    body: 'Third-party chrome injects its styles at runtime, after yours, at the same specificity — so a plain rule loses the tie every time. Reaching for the escape hatch there is correct. Leaving it unexplained means the next person removes it, ships the regression, and puts it back with a worse comment.',
  },
];

/* `TabHue`, not `BadgeHue` — see the note in Dashboard: the sets overlap but differ. */
const FILTERS: Array<{ value: 'all' | Category; label: string; hue: TabHue }> = [
  { value: 'all', label: 'All', hue: 'neutral' },
  { value: 'product', label: 'Product', hue: 'teal' },
  { value: 'systems', label: 'Systems', hue: 'purple' },
  { value: 'motion', label: 'Motion', hue: 'pink' },
  { value: 'writing', label: 'Writing', hue: 'orange' },
];

const PAGE_SIZE = 6;

function NoteCard({ note, onOpen }: { note: Note; onOpen: () => void }) {
  const category = CATEGORY[note.category];

  // The card is the control, so it takes the role, the tab stop and the keys the platform
  // would have given a real button.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  }

  return (
    <Card
      interactive
      seed={note.title}
      role="button"
      tabIndex={0}
      aria-label={`Read “${note.title}”`}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      eyebrow={
        <Row justify="space-between" gap="var(--space-inline)">
          <span>{note.date}</span>
          <span>{note.minutes} min</span>
        </Row>
      }
      title={note.title}
      className="pg-fill"
    >
      <Text style={{ color: 'inherit', fontSize: 'var(--font-size-body-secondary)' }}>
        {note.excerpt}
      </Text>
      {/* `pg-fill` makes the card body a column that fills, so this pins to the bottom and
          the footers line up across a row of cards with excerpts of different lengths. */}
      <Row justify="space-between" gap="var(--space-inline)" style={{ marginTop: 'auto' }}>
        <Badge hue={category.hue} tone="subtle">
          {category.label}
        </Badge>
        <Caption style={{ color: 'var(--color-text-accent)', display: 'inline-flex', gap: 'var(--space-1)' }}>
          Read note <Icon icon={ArrowRight} size="sm" />
        </Caption>
      </Row>
    </Card>
  );
}

function Gallery() {
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [shown, setShown] = useState(PAGE_SIZE);
  const [open, setOpen] = useState<Note | null>(null);

  const matching = filter === 'all' ? NOTES : NOTES.filter((n) => n.category === filter);
  const visible = matching.slice(0, shown);
  const remaining = matching.length - visible.length;

  // A narrower filter can leave the count stranded past the end of the list; resetting it
  // on every change keeps "load more" honest rather than silently already-exhausted.
  function changeFilter(value: string) {
    setFilter(value as 'all' | Category);
    setShown(PAGE_SIZE);
  }

  return (
    <Page>
      <Stack gap="var(--space-stack-lg)" style={{ justifyItems: 'start' }}>
        <Badge hue="pink" tone="bold">
          <Icon icon={Path} size="sm" />
          <span style={{ marginInlineStart: 'var(--space-1)' }}>Field notes</span>
        </Badge>
        <Title size="var(--font-size-display)" leading="var(--font-leading-display)">
          Notes from building the system
        </Title>
        <Lede>
          Short pieces on tokens, contrast, motion and the arguments that come with them.
          Nine of them so far, most written immediately after getting something wrong.
        </Lede>
      </Stack>

      <Stack gap="var(--space-stack)">
        <Row justify="space-between" gap="var(--space-stack)">
          <Tabs
            aria-label="Filter notes by category"
            tabs={FILTERS}
            value={filter}
            onChange={changeFilter}
          />
          <Caption>
            {matching.length} {matching.length === 1 ? 'note' : 'notes'}
          </Caption>
        </Row>

        <Grid min={280} gap="var(--space-stack-lg)">
          {visible.map((note) => (
            <NoteCard key={note.id} note={note} onOpen={() => setOpen(note)} />
          ))}
        </Grid>

        <Row justify="center">
          {remaining > 0 ? (
            <Button variant="secondary" onClick={() => setShown((n) => n + PAGE_SIZE)}>
              Load {Math.min(remaining, PAGE_SIZE)} more
            </Button>
          ) : (
            <Caption>That's all of them.</Caption>
          )}
        </Row>
      </Stack>

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        footer={
          <Button variant="primary" onClick={() => setOpen(null)}>
            Done <Icon icon={ArrowUpRight} size="sm" />
          </Button>
        }
      >
        {open && (
          <Stack gap="var(--space-stack)">
            <Row gap="var(--space-inline)">
              <Badge hue={CATEGORY[open.category].hue} tone="bold">
                {CATEGORY[open.category].label}
              </Badge>
              <Caption>
                {open.date} — {open.minutes} min read
              </Caption>
            </Row>
            <Text style={{ fontWeight: 'var(--font-weight-semibold)' }}>{open.excerpt}</Text>
            <Text style={{ color: 'var(--color-text-muted)' }}>{open.body}</Text>
          </Stack>
        )}
      </Modal>
    </Page>
  );
}

const meta: Meta = {
  title: 'Pages/Gallery',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
};
export default meta;

export const Default: StoryObj = {
  name: 'Gallery',
  render: () => <Gallery />,
};
