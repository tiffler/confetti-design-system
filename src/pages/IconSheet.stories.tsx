import type { Meta, StoryObj } from '@storybook/react-vite';
import type { IconWeight } from '@phosphor-icons/react';
import {
  ArrowRightIcon as ArrowRight,
  BellIcon as Bell,
  CalendarBlankIcon as CalendarBlank,
  CaretDownIcon as CaretDown,
  CaretLeftIcon as CaretLeft,
  CaretRightIcon as CaretRight,
  CaretUpIcon as CaretUp,
  ChartBarIcon as ChartBar,
  ChatCircleTextIcon as ChatCircleText,
  CheckIcon as Check,
  ChecksIcon as Checks,
  CopyIcon as Copy,
  CubeIcon as Cube,
  DotsThreeVerticalIcon as DotsThreeVertical,
  DownloadSimpleIcon as DownloadSimple,
  GearIcon as Gear,
  GlobeIcon as Globe,
  LinkIcon as Link,
  MagicWandIcon as MagicWand,
  MagnifyingGlassIcon as MagnifyingGlass,
  PaperPlaneTiltIcon as PaperPlaneTilt,
  PencilSimpleIcon as PencilSimple,
  PhoneIcon as Phone,
  PlusIcon as Plus,
  QuestionIcon as Question,
  SmileyIcon as Smiley,
  StarIcon as Star,
  TrashIcon as Trash,
  UserCircleIcon as UserCircle,
  XIcon as X,
} from '@phosphor-icons/react';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Icon, type IconSize, type IconTone, type PhosphorIcon } from '../components/Icon/Icon';
import { Caption, Eyebrow, Frame, Lede, Page, Row, Sheet, Stack, Text, Tick, Title } from './kit';

/**
 * The icon sheet. Icons are passed as values rather than names — `<Icon icon={Plus} />` —
 * so a bundler tree-shakes to the ones actually used instead of pulling in all ~9,000. The
 * grid below is a sample of the set, not the set.
 */

const GLYPHS: Array<{ icon: PhosphorIcon; name: string }> = [
  { icon: MagnifyingGlass, name: 'MagnifyingGlass' },
  { icon: Check, name: 'Check' },
  { icon: Checks, name: 'Checks' },
  { icon: ChartBar, name: 'ChartBar' },
  { icon: Cube, name: 'Cube' },
  { icon: PaperPlaneTilt, name: 'PaperPlaneTilt' },
  { icon: ChatCircleText, name: 'ChatCircleText' },
  { icon: UserCircle, name: 'UserCircle' },
  { icon: Phone, name: 'Phone' },
  { icon: Bell, name: 'Bell' },
  { icon: PencilSimple, name: 'PencilSimple' },
  { icon: Globe, name: 'Globe' },
  { icon: Plus, name: 'Plus' },
  { icon: Smiley, name: 'Smiley' },
  { icon: Link, name: 'Link' },
  { icon: Star, name: 'Star' },
  { icon: DotsThreeVertical, name: 'DotsThreeVertical' },
  { icon: X, name: 'X' },
  { icon: CalendarBlank, name: 'CalendarBlank' },
  { icon: Copy, name: 'Copy' },
  { icon: CaretDown, name: 'CaretDown' },
  { icon: CaretUp, name: 'CaretUp' },
  { icon: CaretLeft, name: 'CaretLeft' },
  { icon: CaretRight, name: 'CaretRight' },
  { icon: Gear, name: 'Gear' },
  { icon: DownloadSimple, name: 'DownloadSimple' },
  { icon: Question, name: 'Question' },
  { icon: MagicWand, name: 'MagicWand' },
  { icon: Trash, name: 'Trash' },
  { icon: ArrowRight, name: 'ArrowRight' },
];

const SIZES: IconSize[] = ['sm', 'md', 'lg'];
const TONES: IconTone[] = ['inherit', 'default', 'muted', 'accent'];

/* Bold is the system weight — it matches the 2px sticker linework. The others are shown
   so the escape hatch is documented, not so it gets used. */
const WEIGHTS: IconWeight[] = ['regular', 'bold', 'fill'];

function Tile({ icon, name }: { icon: PhosphorIcon; name: string }) {
  return (
    <div
      title={name}
      style={{
        display: 'grid',
        placeItems: 'center',
        aspectRatio: '1',
        background: 'var(--color-surface-raised)',
        border: 'var(--border-width-hairline) solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Icon icon={icon} size="md" />
    </div>
  );
}

function IconSheet() {
  return (
    <Page width={1280}>
      <Stack gap="var(--space-2)">
        <Eyebrow>Specimen sheet</Eyebrow>
        <Title>Icons</Title>
        <Lede>
          One weight, three sizes, four tones. A mixed-weight icon set is the fastest way to
          make a system look assembled rather than designed, so bold is the system weight and
          everything else is an exception you have to ask for.
        </Lede>
      </Stack>

      <Frame label="Glyphs — a sample of the set">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
            gap: 'var(--space-inline)',
          }}
        >
          {GLYPHS.map((glyph) => (
            <Tile key={glyph.name} icon={glyph.icon} name={glyph.name} />
          ))}
        </div>
        <Caption>Hover a tile for its Phosphor name.</Caption>
      </Frame>

      <Sheet columnWidth={340}>
        <Frame label="Size — sm 16 / md 20 / lg 24">
          <Row gap="var(--space-stack)" align="flex-end">
            {SIZES.map((size) => (
              <Stack key={size} gap="var(--space-1)" style={{ justifyItems: 'center' }}>
                <Icon icon={Star} size={size} tone="default" />
                <Tick>{size}</Tick>
              </Stack>
            ))}
          </Row>
          <Caption>Sizing comes from a token, not a pixel prop — the glyph is set to 100%.</Caption>
        </Frame>

        <Frame label="Tone">
          <Row gap="var(--space-stack)">
            {TONES.map((tone) => (
              <Stack key={tone} gap="var(--space-1)" style={{ justifyItems: 'center' }}>
                <Icon icon={Star} size="md" tone={tone} />
                <Tick>{tone}</Tick>
              </Stack>
            ))}
          </Row>
          <Caption>`inherit` is the default: it takes the surrounding text colour.</Caption>
        </Frame>

        <Frame label="Weight — bold is the system weight">
          <Row gap="var(--space-stack)">
            {WEIGHTS.map((weight) => (
              <Stack key={weight} gap="var(--space-1)" style={{ justifyItems: 'center' }}>
                <Icon icon={Star} size="lg" tone="default" weight={weight} />
                <Tick>{weight}</Tick>
              </Stack>
            ))}
          </Row>
        </Frame>

        <Frame label="In context">
          <Row gap="var(--space-inline)">
            <Button variant="primary">
              <Icon icon={Plus} size="sm" /> New
            </Button>
            <Button variant="secondary">
              Next <Icon icon={ArrowRight} size="sm" />
            </Button>
            <Button variant="ghost" aria-label="Close">
              <Icon icon={X} size="md" />
            </Button>
          </Row>
          <Row gap="var(--space-inline)">
            <Badge hue="teal" tone="bold">
              <Icon icon={Check} size="sm" />
              <span style={{ marginInlineStart: 'var(--space-1)' }}>Done</span>
            </Badge>
            <Badge hue="orange" tone="subtle">
              <Icon icon={Bell} size="sm" />
              <span style={{ marginInlineStart: 'var(--space-1)' }}>3 alerts</span>
            </Badge>
          </Row>
          <Caption>
            Inside a button the icon inherits the label colour, so it follows every variant and
            every state without being told.
          </Caption>
        </Frame>

        <Frame label="Decorative vs. labelled">
          <Row gap="var(--space-inline)">
            <Icon icon={Bell} size="md" tone="default" />
            <Text style={{ fontSize: 'var(--font-size-body-secondary)' }}>
              Decorative — hidden from assistive tech
            </Text>
          </Row>
          <Row gap="var(--space-inline)">
            <Icon icon={Bell} size="md" tone="default" label="Notifications" />
            <Text style={{ fontSize: 'var(--font-size-body-secondary)' }}>
              Labelled — exposed as an image with a name
            </Text>
          </Row>
          <Caption>
            Omit the label when adjacent text already carries the meaning, or the icon gets
            read out twice. An icon-only button needs a name on the button itself.
          </Caption>
        </Frame>
      </Sheet>
    </Page>
  );
}

const meta: Meta = {
  title: 'Pages/Icon sheet',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
};
export default meta;

export const Default: StoryObj = {
  name: 'Icon sheet',
  render: () => <IconSheet />,
};
