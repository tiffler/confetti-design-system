# Changelog

All notable changes to Confetti. Versions follow [semver](https://semver.org): a token
or component change that alters rendered output is a **minor** bump (consumers pull it via
the token sync); additive-only, non-visual changes are **patch**.

## [0.2.0] — 2026-07-24

### Added

- **`Tabs` component** — a segmented control (pill group with a sliding active indicator).
  The active pill consumes the **same `--badge-*` tokens** as Badge, so a lit tab is
  pixel-for-pixel a bold Badge of the matching hue. Per-tab `hue`, full keyboard support
  (arrows / Home / End, roving `tabindex`, `role="tablist"`). The system is now five
  components: Button, Card, Badge, **Tabs**, Icon.
- **`--tabs-*` component tokens** (`tokens/component/portfolio/tabs.json`) — track fill,
  border, radius, padding, gap, idle label, and transition, all referencing semantic roles.
- **`border.width.thin`** semantic role (1px) — the soft-pill / chip outline, shared by
  Badge and the Tabs indicator.
- **Storybook** — `Components/Tabs` with an *Active tab === Badge* story proving the match,
  plus a per-accent story.

### Changed

- **Badge pill softened** *(visual — consumers will see it)*. The shared pill treatment is
  now the **soft** look: `--badge-border-width` 2px → **1px** (`border.width.thin`) and
  `--badge-border-color` ink → **`color.border.subtle`**. The foreground is unchanged
  (`color.accent.on-bold` — ink in both modes, which stays legible on the pastel accent
  fill; `text-primary` was intentionally *not* used, as it flips to cream in dark). Badge is
  now the single source of truth for the pill, reused by Tabs.

## [0.1.0]

- Initial system: three-tier token architecture (primitive → semantic → component) with
  build-time layer enforcement; independent theme × mode axes via the CSS cascade; three
  themes (Confetti, Adventure, Neon) each in light and dark; Button, Card, Badge, Icon;
  DTCG / Tailwind / CSS / JSON token export; Storybook with foundations and a cover page.
