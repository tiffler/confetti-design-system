import { Fragment, useState, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus } from '@phosphor-icons/react';
import { Badge, type BadgeHue, type BadgeTone } from '../components/Badge/Badge';
import { Button, type ButtonVariant } from '../components/Button/Button';
import { Card, type CardSurface } from '../components/Card/Card';
import { Icon, type IconSize, type IconTone } from '../components/Icon/Icon';
import { Modal } from '../components/Modal/Modal';
import { Tabs, type TabHue } from '../components/Tabs/Tabs';
import { Toast, type ToastTone } from '../components/Toast/Toast';
import { Caption, Eyebrow, Frame, Lede, Page, Row, Sheet, Stack, Text, Tick, Title } from './kit';

/**
 * The specimen sheet: every component the system ships, in every variant and every state,
 * on one page. The other pages under `Pages/` show the components doing a job; this one is
 * the reference you scan when you want to know what exists and what it does when touched.
 *
 * States that a static page cannot trigger — hover, focus, pressed — are pinned with the
 * `data-force` hook the components define for exactly this purpose (see the note in
 * Button.css). It changes nothing at runtime; the real pseudo-classes still drive the live
 * component, which is why the sheet can sit beside a snapshot tool without lying.
 */

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];

/* Badge and Tabs share a palette but not a vocabulary: `success` is a state, and a tab is a
   category, so the sets are listed separately rather than one being cast to the other. */
const BADGE_HUES: BadgeHue[] = ['purple', 'teal', 'orange', 'pink', 'success', 'neutral'];
const TAB_HUES: TabHue[] = ['purple', 'teal', 'orange', 'pink', 'neutral'];
const TOAST_TONES: ToastTone[] = ['success', 'danger', 'neutral'];
const TONES: BadgeTone[] = ['bold', 'subtle'];
const ICON_SIZES: IconSize[] = ['sm', 'md', 'lg'];
const ICON_TONES: IconTone[] = ['inherit', 'default', 'muted', 'accent'];

type SpecimenRow = { key: string; label: string; force?: string; disabled?: boolean };

/* Rest first, then the three states a page cannot otherwise hold still, then disabled —
   which suppresses hover and pressed entirely, so it belongs at the end rather than in
   the middle of the interactive run. */
const BUTTON_ROWS: SpecimenRow[] = [
  { key: 'rest', label: 'Rest' },
  { key: 'hover', label: 'Hover', force: 'hover' },
  { key: 'focus', label: 'Focus', force: 'focus' },
  { key: 'pressed', label: 'Pressed', force: 'pressed' },
  { key: 'disabled', label: 'Disabled', disabled: true },
];

/** `data-force` is a docs-only CSS hook, kept out of the public props type. */
const forced = (row: SpecimenRow): Record<string, string> =>
  row.force ? { 'data-force': row.force } : {};

const BUTTON_CONFIGS: Array<{
  key: string;
  label: string;
  render: (variant: ButtonVariant, row: SpecimenRow) => ReactElement;
}> = [
  {
    key: 'label',
    label: 'Label',
    render: (variant, row) => (
      <Button variant={variant} disabled={row.disabled} {...forced(row)}>
        btn_text
      </Button>
    ),
  },
  {
    key: 'leading',
    label: 'Icon + label',
    render: (variant, row) => (
      <Button variant={variant} disabled={row.disabled} {...forced(row)}>
        <Icon icon={Plus} size="sm" /> btn_text
      </Button>
    ),
  },
  {
    key: 'trailing',
    label: 'Label + icon',
    render: (variant, row) => (
      <Button variant={variant} disabled={row.disabled} {...forced(row)}>
        btn_text <Icon icon={ArrowRight} size="sm" />
      </Button>
    ),
  },
  {
    key: 'iconOnly',
    label: 'Icon only',
    render: (variant, row) => (
      <Button variant={variant} disabled={row.disabled} aria-label="Add item" {...forced(row)}>
        <Icon icon={Plus} size="md" />
      </Button>
    ),
  },
];

function ButtonMatrix({ variant }: { variant: ButtonVariant }) {
  return (
    <Stack gap="var(--space-2)">
      <Tick style={{ color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
        {variant}
      </Tick>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content repeat(4, max-content)',
          gap: 'var(--space-inline)',
          alignItems: 'center',
        }}
      >
        <span />
        {BUTTON_CONFIGS.map((config) => (
          <Tick key={config.key}>{config.label}</Tick>
        ))}

        {BUTTON_ROWS.map((row) => (
          <Fragment key={row.key}>
            <Tick>{row.label}</Tick>
            {BUTTON_CONFIGS.map((config) => (
              <div key={config.key}>{config.render(variant, row)}</div>
            ))}
          </Fragment>
        ))}
      </div>
    </Stack>
  );
}

/** Each hue gets its own live Tabs, so the sliding indicator can actually be driven. */
function TabsSpecimen({ hue }: { hue: TabHue }) {
  const [value, setValue] = useState('one');
  return (
    <Tabs
      aria-label={`${hue} tabs specimen`}
      value={value}
      onChange={setValue}
      tabs={[
        { value: 'one', label: 'Overview', hue },
        { value: 'two', label: 'Details', hue },
        { value: 'three', label: 'Activity', hue },
      ]}
    />
  );
}

function CardSpecimen({
  surface,
  interactive,
  force,
  label,
}: {
  surface: CardSurface;
  interactive?: boolean;
  force?: boolean;
  label: string;
}) {
  return (
    <Card
      surface={surface}
      interactive={interactive}
      seed={label}
      eyebrow="Eyebrow"
      title="Card title"
      {...(force ? { 'data-force': 'hover' } : {})}
    >
      {label}
    </Card>
  );
}

function ModalSpecimen() {
  const [size, setSize] = useState<'sm' | 'md' | null>(null);
  return (
    <>
      <Row gap="var(--space-inline)">
        <Button variant="secondary" onClick={() => setSize('sm')}>
          Open sm
        </Button>
        <Button variant="secondary" onClick={() => setSize('md')}>
          Open md
        </Button>
      </Row>
      <Caption>
        The dialog renders in the top layer, so it cannot be shown inline on the sheet —
        open one to see it.
      </Caption>

      <Modal
        open={size !== null}
        onClose={() => setSize(null)}
        size={size ?? 'md'}
        title={`Modal — ${size ?? ''} size`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSize(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setSize(null)}>
              Confirm
            </Button>
          </>
        }
      >
        <Text style={{ color: 'var(--color-text-muted)' }}>
          A controlled dialog on the native `&lt;dialog&gt;` element: real focus trap, the rest
          of the page inert, Escape handled, and the scrim is the element itself — a click that
          misses the panel dismisses it.
        </Text>
      </Modal>
    </>
  );
}

function ComponentSheet() {
  return (
    <Page width={1280}>
      <Stack gap="var(--space-2)">
        <Eyebrow>Specimen sheet</Eyebrow>
        <Title>Every component, every state</Title>
        <Lede>
          Seven components, their variants and their interaction states, pinned side by side.
          Flip the Theme and Mode switchers — nothing here is hardcoded, so the whole sheet
          re-skins.
        </Lede>
      </Stack>

      {/* The button matrix is the widest group on the sheet and the one people scan first,
          so it sits full width above the masonry rather than inside a 320px column. */}
      <Frame label="Button — variant × state × content">
        <Stack gap="var(--space-stack-lg)">
          {VARIANTS.map((variant) => (
            <ButtonMatrix key={variant} variant={variant} />
          ))}
        </Stack>
      </Frame>

      {/* Also full width: a tab track is as wide as its labels, and five of them wrapped
          into a 340px masonry column spill straight through the frame. */}
      <Frame label="Tabs — one per hue">
        <Row gap="var(--space-stack)" align="flex-start">
          {TAB_HUES.map((hue) => (
            <Stack key={hue} gap="var(--space-1)">
              <Tick>{hue}</Tick>
              <TabsSpecimen hue={hue} />
            </Stack>
          ))}
        </Row>
      </Frame>

      {/* Full width for the same reason as Tabs: a toast carries a `min-width` of the small
          dialog, so three of them in a 340px masonry column spill through the frame. */}
      <Frame label="Toast — tone">
        <Row gap="var(--space-stack)" align="flex-start">
          {TOAST_TONES.map((tone) => (
            <Toast
              key={tone}
              tone={tone}
              title={
                tone === 'success' ? 'Changes saved' : tone === 'danger' ? "Couldn't publish" : 'Build queued'
              }
              onDismiss={() => {}}
            >
              {tone === 'danger' ? 'Nothing was written.' : 'Tone shows in the edge and the icon.'}
            </Toast>
          ))}
        </Row>
      </Frame>

      <Sheet columnWidth={340}>
        <Frame label="Badge — hue × tone">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'max-content repeat(2, max-content)',
              gap: 'var(--space-inline)',
              alignItems: 'center',
            }}
          >
            <span />
            {TONES.map((tone) => (
              <Tick key={tone}>{tone}</Tick>
            ))}
            {BADGE_HUES.map((hue) => (
              <Fragment key={hue}>
                <Tick>{hue}</Tick>
                {TONES.map((tone) => (
                  <Badge key={tone} hue={hue} tone={tone}>
                    {hue}
                  </Badge>
                ))}
              </Fragment>
            ))}
          </div>
        </Frame>

        <Frame label="Card — surface × interactive">
          <CardSpecimen surface="card" label="surface: card" />
          <CardSpecimen surface="raised" label="surface: raised" />
          <CardSpecimen surface="card" interactive label="interactive — rest" />
          <CardSpecimen surface="card" interactive force label="interactive — hover (pinned)" />
        </Frame>

        <Frame label="Icon — size">
          {/* Bottom-aligned: the three glyph boxes are different heights, so centring them
              staggers the labels underneath. */}
          <Row gap="var(--space-stack)" align="flex-end">
            {ICON_SIZES.map((size) => (
              <Stack key={size} gap="var(--space-1)" style={{ justifyItems: 'center' }}>
                <Icon icon={Plus} size={size} tone="default" />
                <Tick>{size}</Tick>
              </Stack>
            ))}
          </Row>
        </Frame>

        <Frame label="Icon — tone">
          <Row gap="var(--space-stack)">
            {ICON_TONES.map((tone) => (
              <Stack key={tone} gap="var(--space-1)" style={{ justifyItems: 'center' }}>
                <Icon icon={Plus} size="md" tone={tone} />
                <Tick>{tone}</Tick>
              </Stack>
            ))}
          </Row>
          <Caption>
            `inherit` takes the surrounding text colour — which is what makes it correct
            inside a button or a link.
          </Caption>
        </Frame>

        <Frame label="Modal — sm / md">
          <ModalSpecimen />
        </Frame>

      </Sheet>
    </Page>
  );
}

const meta: Meta = {
  title: 'Pages/Component sheet',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
};
export default meta;

export const Default: StoryObj = {
  name: 'Component sheet',
  render: () => <ComponentSheet />,
};
