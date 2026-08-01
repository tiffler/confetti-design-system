import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CheckIcon as Check,
  EnvelopeIcon as Envelope,
  SparkleIcon as Sparkle,
} from '@phosphor-icons/react';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Icon } from '../components/Icon/Icon';
import { Modal } from '../components/Modal/Modal';
import { Tabs } from '../components/Tabs/Tabs';
import { Caption, Eyebrow, Figure, Grid, Lede, Page, Row, Rule, Stack, Text, Title } from './kit';

/**
 * A pricing page — the marketing shape, and the one that leans hardest on the type scale
 * and on Card as a container rather than as a tile. The billing switcher is a real Tabs
 * instance driving the figures, so the page has one piece of state and it is visible.
 */

type Billing = 'monthly' | 'annual';

type Plan = {
  id: string;
  name: string;
  blurb: string;
  price: Record<Billing, string>;
  unit: Record<Billing, string>;
  cta: string;
  featured?: boolean;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    blurb: 'For one designer and a handful of screens.',
    price: { monthly: '$0', annual: '$0' },
    unit: { monthly: 'free forever', annual: 'free forever' },
    cta: 'Start building',
    features: [
      'Up to 3 projects',
      'Light and dark modes',
      'Core component library',
      'Community support',
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    blurb: 'For a team shipping a product on a real schedule.',
    price: { monthly: '$24', annual: '$19' },
    unit: { monthly: 'per editor / month', annual: 'per editor / month, billed yearly' },
    cta: 'Start free trial',
    featured: true,
    features: [
      'Unlimited projects',
      'Custom themes and brand kits',
      'Token pipeline and CI checks',
      'Visual regression snapshots',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    blurb: 'For several teams and a procurement department.',
    price: { monthly: 'Custom', annual: 'Custom' },
    unit: { monthly: 'talk to us', annual: 'talk to us' },
    cta: 'Talk to sales',
    features: [
      'Everything in Studio',
      'SSO and audit logs',
      'Private component registry',
      'Design system review sessions',
      'A named human',
    ],
  },
];

const BILLING: Array<{ value: Billing; label: string; hue: 'neutral' | 'teal' }> = [
  { value: 'monthly', label: 'Monthly', hue: 'neutral' },
  { value: 'annual', label: 'Annual — save 20%', hue: 'teal' },
];

const FAQ = [
  {
    q: 'What counts as an editor?',
    a: 'Anyone who can change a token or publish a component. Viewers, reviewers and anyone who only reads the docs are free and unlimited.',
  },
  {
    q: 'Can we bring our own brand?',
    a: 'That is the whole design. A theme is a brand-kit contract of about eight values — repoint those and every component follows, in both modes.',
  },
  {
    q: 'What happens when we cancel?',
    a: 'Your tokens export as JSON and CSS custom properties, and the components are plain React. Nothing you built stops working.',
  },
  {
    q: 'Do you offer education pricing?',
    a: 'Students and educators get Studio at no cost. Send anything that looks vaguely institutional and we will sort it out.',
  },
];

function PlanCard({ plan, billing, onContact }: { plan: Plan; billing: Billing; onContact: () => void }) {
  return (
    <Card
      className="pg-fill"
      surface={plan.featured ? 'raised' : 'card'}
      seed={plan.name}
      style={{ '--pg-fill-gap': 'var(--space-stack-lg)' } as CSSProperties}
    >
      <Stack gap="var(--space-2)">
        {/* Only one plan carries the badge, but every plan reserves its height — otherwise
            the featured card's header is taller and its price sits a few pixels low. Built
            from the badge's own tokens so it stays exact if the pill is ever retuned, and
            measured against whichever of the label or the icon is taller: this badge has an
            icon in it, and at 16px the glyph outgrows the 12px text line. */}
        <Row
          justify="space-between"
          gap="var(--space-inline)"
          style={{
            minHeight:
              'calc(max(var(--badge-font-size), var(--size-icon-sm)) + 2 * var(--badge-padding-y) + 2 * var(--badge-border-width))',
          }}
        >
          <Eyebrow>{plan.name}</Eyebrow>
          {plan.featured && (
            <Badge hue="pink" tone="bold">
              <Icon icon={Sparkle} size="sm" />
              <span style={{ marginInlineStart: 'var(--space-1)' }}>Most popular</span>
            </Badge>
          )}
        </Row>
        {/* Two lines are reserved whether the blurb needs them or not: without it a
            one-line blurb lifts that card's price above its neighbours', and a row of
            prices that don't line up is the first thing you notice on a pricing page. */}
        <Text
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-body-secondary)',
            minHeight: 'calc(2em * var(--font-leading-body))',
          }}
        >
          {plan.blurb}
        </Text>
      </Stack>

      <Stack gap="var(--space-1)">
        <Figure style={{ fontSize: 'var(--font-size-h1)' }}>{plan.price[billing]}</Figure>
        <Caption>{plan.unit[billing]}</Caption>
      </Stack>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-2)' }}>
        {plan.features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              gap: 'var(--space-inline)',
              alignItems: 'flex-start',
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-body-secondary)',
              lineHeight: 'var(--font-leading-body)',
              color: 'var(--color-text-primary)',
            }}
          >
            <Icon icon={Check} size="sm" tone="accent" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Physical `margin-top`, not `margin-block-start`: only the physical property
          actually absorbs the free space as a flex auto margin here, and without it the
          CTA floats mid-card on the shortest plan. */}
      <div style={{ marginTop: 'auto' }}>
        <Button
          variant={plan.featured ? 'primary' : 'secondary'}
          style={{ width: '100%' }}
          onClick={plan.id === 'enterprise' ? onContact : undefined}
        >
          {plan.cta}
        </Button>
      </div>
    </Card>
  );
}

function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly');
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <Page>
      <Stack gap="var(--space-stack-lg)" style={{ justifyItems: 'center', textAlign: 'center' }}>
        <Eyebrow>Pricing</Eyebrow>
        <Title size="var(--font-size-display)" leading="var(--font-leading-display)">
          Pick a plan, change it later
        </Title>
        <Lede style={{ textAlign: 'center' }}>
          Every plan ships the same components and the same token pipeline. The paid tiers buy
          you seats, themes and someone to shout at.
        </Lede>
        <Tabs
          aria-label="Billing period"
          tabs={BILLING}
          value={billing}
          onChange={(value) => setBilling(value as Billing)}
        />
      </Stack>

      <Grid min={280} gap="var(--space-stack-lg)" style={{ alignItems: 'stretch' }}>
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            onContact={() => setContactOpen(true)}
          />
        ))}
      </Grid>

      <Rule />

      <Stack gap="var(--space-stack-lg)">
        <Title as="h2" size="var(--font-size-h3)">
          Questions people actually ask
        </Title>
        <Grid min={300} gap="var(--space-stack)">
          {FAQ.map((item) => (
            <Card key={item.q} surface="raised" title={item.q} seed={item.q}>
              {item.a}
            </Card>
          ))}
        </Grid>
      </Stack>

      <Card surface="raised" seed="cta-footer">
        <Row justify="space-between" gap="var(--space-stack)">
          <Stack gap="var(--space-1)">
            <Title as="h3" size="var(--font-size-h4)">
              Still deciding?
            </Title>
            <Text style={{ color: 'var(--color-text-muted)' }}>
              We will walk your team through the token architecture — no slides.
            </Text>
          </Stack>
          <Button variant="primary" onClick={() => setContactOpen(true)}>
            <Icon icon={Envelope} size="sm" /> Talk to sales
          </Button>
        </Row>
      </Card>

      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        size="sm"
        title="Talk to sales"
        footer={
          <>
            <Button variant="secondary" onClick={() => setContactOpen(false)}>
              Not now
            </Button>
            <Button variant="primary" onClick={() => setContactOpen(false)}>
              Request a call
            </Button>
          </>
        }
      >
        <Stack gap="var(--space-stack)">
          <Text style={{ color: 'var(--color-text-muted)' }}>
            Tell us roughly how many editors you have and which brands you need to support.
            Someone gets back to you inside a working day.
          </Text>
          <Row gap="var(--space-inline)">
            <Badge hue="teal" tone="subtle">
              Avg. reply 4h
            </Badge>
            <Badge hue="purple" tone="subtle">
              No sales deck
            </Badge>
          </Row>
        </Stack>
      </Modal>
    </Page>
  );
}

const meta: Meta = {
  title: 'Pages/Pricing',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
};
export default meta;

export const Default: StoryObj = {
  name: 'Pricing',
  render: () => <Pricing />,
};
