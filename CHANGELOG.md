# Changelog

All notable changes to Confetti. Versions follow [semver](https://semver.org): a token
or component change that alters rendered output is a **minor** bump (consumers pull it via
the token sync); additive-only, non-visual changes are **patch**.

## [0.3.0] — 2026-07-27

### Added

- **`Modal` component** — a dialog built on the native `<dialog>` element, opened with
  `showModal()`, so the focus trap, `inert` on the page behind, Escape handling, and the
  top layer come from the platform instead of component code. The element itself is the
  scrim (it fills the viewport and paints the dim), which makes a click that misses the
  panel the dismiss target and needs no z-index. The panel is **Card-weight** — same fill,
  2px sticker border, container radius, and hard offset shadow, held at rest. Two widths
  (`sm` 420px, `md` 560px), an optional `footer` for actions, and a `title` wired up as
  `aria-labelledby`. Fully controlled: Escape, the close button, and a scrim click all
  route through `onClose`. The system is now six components: Button, Card, Badge, Tabs,
  **Modal**, Icon.
- **`--modal-*` component tokens** (`tokens/component/portfolio/modal.json`) — scrim,
  panel surface, border, radius, shadow, padding, gaps, the two widths, and the title /
  body type ramps, all referencing semantic roles.
- **`size.dialog.sm` / `size.dialog.md`** semantic roles, over new `width.dialog-*`
  primitives (`tokens/primitives/sizes.json`) — raw content widths, deliberately off the
  4px space ramp because they are measures, not spacing.

### Notes

- `--color-scrim`, added in v0.2.1, now has its first consumer. It stays fixed across
  every theme × mode, so the panel always sits on a deep ink field. One consequence worth
  knowing: in **dark** mode the panel's border and shadow resolve to cream and the sticker
  edge reads against the dim; in **light** they resolve to ink on ink, so the outline is
  painted but invisible and the panel's own silhouette carries the edge. This is the
  per-mode token repointing working as intended — see **Components → Modal → Default**.

## [0.2.1] — 2026-07-25

### Added — new tokens (additive; no change to existing output, so a patch)

- **`--color-scrim`** — modal / lightbox overlay dim (`ink.900` @ 86%, fixed across
  modes/themes). New primitive `color.ink.a86`.
- **`--color-surface-backdrop`** — a recessed "mat" surface a step below `page`, for app
  frames / control tracks. Defined per theme × mode (light = each theme's soft dark-muted
  neutral: `ink.200` / `sage.400` / `glow.400`; dark = the deepest surface). Added to the
  required schema, so every theme must supply it.
- **`--font-size-18` / `--font-size-22`** — utility type steps (off the 4px grid, like `14`).

Auto-exposed as Tailwind keys (`bg-scrim`, `bg-surface-backdrop`, `text-18`, `text-22`) and
shown live in the Storybook Foundations.

## [0.2.0] — 2026-07-24

### Added

- **`Tabs` component** — a segmented control (pill group with a sliding active indicator).
  The active pill borrows Badge's **palette** (the `--badge-*` fill, 1px subtle border,
  radius, ink label), so a lit tab and a Badge read as one system per hue — sized as a
  comfortable control (roomy padding, readable mono label). Per-tab `hue`, full keyboard support
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
