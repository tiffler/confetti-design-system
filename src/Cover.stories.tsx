import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowUpRightIcon as ArrowUpRight,
  ConfettiIcon as ConfettiGlyph,
} from '@phosphor-icons/react';
import { Button } from './components/Button/Button';
import { Card } from './components/Card/Card';
import { Badge } from './components/Badge/Badge';
import { Icon } from './components/Icon/Icon';
import { useTheme, DEFAULT_THEME, type Theme } from './theme/ThemeProvider';
import pkg from '../package.json';
import './Cover.css';

/**
 * The landing page. Built from Confetti's own components (Button, Card, Badge, Icon) and
 * themed by the toolbar decorator — so flipping the Theme switcher re-skins the cover too.
 */

// Bump when you cut a release. (Version is read live from package.json.)
const LAST_UPDATED = 'July 27, 2026';
// (Modal — the sixth component, and the first consumer of the scrim — v0.3.0)
const PORTFOLIO = 'https://tienmedia.com';

/**
 * What the cover calls the theme it is currently wearing. The head of THEMES is the system's
 * own starting point rather than a brand of its own, so it shows as "Default" — every other
 * theme is named for itself. Derived from DEFAULT_THEME rather than matched against the
 * string 'confetti', so reordering the axis moves this label with it.
 */
function themeLabel(theme: Theme): string {
  if (theme === DEFAULT_THEME) return 'Default';
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

function Cover() {
  const { theme } = useTheme();

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
          <Badge hue="purple" tone="bold">
            Design System
          </Badge>
          <Badge hue="teal" tone="subtle">
            v{pkg.version}
          </Badge>
        </div>

        {/* Title and theme name are one unit on their own tighter gap — as separate children
            of the outer grid they would sit a full stack-lg apart and read as two blocks. */}
        <div style={{ display: 'grid', gap: 'var(--space-inset-sm)', justifyItems: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-display)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--font-leading-heading)',
              margin: 0,
            }}
          >
            {/* Decorative — the word beside it carries the meaning, so no `label`. */}
            <Icon icon={ConfettiGlyph} size="lg" tone="accent" className="cf-cover__glyph" /> Confetti
          </h1>

          {/* The theme currently selected in the toolbar, in that theme's own accent — so the
              cover states which of the three you are looking at instead of leaving you to
              infer it from the colors. */}
          <p
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--font-size-label)',
              letterSpacing: 'var(--font-tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--color-text-accent)',
              margin: 0,
            }}
          >
            {themeLabel(theme)}
          </p>
        </div>

        <Card surface="raised" eyebrow="What's inside" title="Themeable token system">
          Primitive → semantic → component tokens and a brand-kit contract: define a handful of
          inputs and you have a new theme, in light and dark. Three ship as worked examples —
          Confetti, Adventure and Neon. Have a poke around Foundations and Components in the
          sidebar.
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
          {/* The row would otherwise read as the complete set. It isn't one. */}
          <Badge hue="neutral" tone="subtle">
            + yours
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
    docs: { disable: true },
  },
};
export default meta;

/**
 * The story's name matches the title exactly, which is what triggers Storybook's
 * single-story hoisting: a lone story whose name equals its component's name replaces that
 * component in the sidebar instead of nesting inside it. So "Confetti" is one clickable
 * entry that opens the cover, rather than a folder you have to expand first.
 *
 * The export keeps its old name so the story ID stays `confetti--welcome` and existing
 * links do not break — hoisting keys off the display name, not the export.
 */
export const Welcome: StoryObj = {
  name: 'Confetti',
  render: () => <Cover />,
};
