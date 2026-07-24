import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowUpRight } from '@phosphor-icons/react';
import { Button } from './components/Button/Button';
import { Card } from './components/Card/Card';
import { Badge } from './components/Badge/Badge';
import { Icon } from './components/Icon/Icon';
import pkg from '../package.json';

/**
 * The landing page. Built from Confetti's own components (Button, Card, Badge, Icon) and
 * themed by the toolbar decorator — so flipping the Theme switcher re-skins the cover too.
 */

// Bump when you cut a release. (Version is read live from package.json.)
const LAST_UPDATED = 'July 24, 2026';
const PORTFOLIO = 'https://tienmedia.com';

function Cover() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '82vh' }}>
      <div
        style={{
          maxWidth: 680,
          width: '100%',
          display: 'grid',
          gap: 'var(--space-stack-lg)',
          justifyItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-inline)', alignItems: 'center' }}>
          <Badge hue="orange" tone="bold">
            Design System
          </Badge>
          <Badge hue="teal" tone="subtle">
            v{pkg.version}
          </Badge>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-display)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--font-leading-heading)',
            margin: 0,
          }}
        >
          🎊 Confetti
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-h5)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--font-leading-body)',
            margin: 0,
          }}
        >
          A sticker-flavoured, multi-theme design system. Three themes, two modes, one set of
          tokens — change a handful of values and the whole thing re-skins. Built to make demos
          look <em>intentional</em>, not assembled.
        </p>

        <Card surface="raised" eyebrow="What's inside" title="Tokens, themed three ways">
          Primitive → semantic → component tokens, a brand-kit contract, and three built-in looks —
          Confetti, Adventure, and Neon — each with its own light and dark. Have a poke around
          Foundations and Components in the sidebar.
        </Card>

        <div style={{ display: 'flex', gap: 'var(--space-inline)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Badge hue="pink" tone="bold">
            Confetti
          </Badge>
          <Badge hue="teal" tone="bold">
            Adventure
          </Badge>
          <Badge hue="purple" tone="bold">
            Neon
          </Badge>
        </div>

        <Button
          variant="primary"
          onClick={() => window.open(PORTFOLIO, '_blank', 'noopener,noreferrer')}
        >
          Visit tienmedia.com <Icon icon={ArrowUpRight} size="sm" />
        </Button>

        <p
          style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--font-size-label)',
            letterSpacing: 'var(--font-tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            margin: 0,
            display: 'flex',
            gap: 'var(--space-inline)',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span>Version {pkg.version}</span>
          <span aria-hidden>·</span>
          <span>Updated {LAST_UPDATED}</span>
          <span aria-hidden>·</span>
          <span>
            Built by{' '}
            <a
              href={PORTFOLIO}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-text-accent)', textDecoration: 'underline' }}
            >
              tiffler
            </a>
          </span>
        </p>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Confetti',
  parameters: {
    layout: 'fullscreen',
    options: { showPanel: false },
    docs: { disable: true },
  },
};
export default meta;

export const Welcome: StoryObj = {
  name: 'Welcome',
  render: () => <Cover />,
};
