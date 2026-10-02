# Changelog

All notable changes to Confetti. Versions follow [semver](https://semver.org): a token
or component change that alters rendered output is a **minor** bump (consumers pull it via
the token sync); additive-only, non-visual changes are **patch**.

## [Unreleased]


### Changed

Everything below is **visual — consumers will see it.** It applies to the Confetti theme;
Adventure and Neon resolve to identical values apart from the shared scrim tint and the
success-on-subtle text tint.

- **Light mode is a luxury white.** A new `colors.porcelain` ramp replaces the cream/greige:
  a bright white with the faintest cool cast and an indigo-black ink. The four surface steps
  (card, raised, page, panel) are evenly spaced, with raised at the midpoint of page and card.
- **Dark mode is midnight.** A new `colors.midnight` ramp: a rich indigo-black page with dark
  charcoal cards that carry a tiny hint of indigo, evenly spaced surface steps, and
  lavender-tinged text. The code-block / dark-panel ground and the scrim follow it, so no brown
  or cream remains in Confetti's dark. Contrast improves (the palest brand red reads at 7.32:1
  on the lightest surface, up from 4.96:1). The unused `graphite`, `chalk`, `cream`, `ink` and
  `stone` primitives and the hard shadows are removed.
- **Softer shape.** Hairline borders (`borders.stroke-color.default` is a low-alpha stroke), a
  20px container radius (`radius.500`), no card tilt, and headings at Fredoka 400
  (`font.weight.regular`). Labels and controls keep their tracked mono.
- **Hover never moves anything.** Cards glow instead: an indigo halo with a lit edge on dark
  (`shadow.halo-deep`, plus a faint top edge via `elevation.edge`) and an ink halo of identical
  size and spread on light (`shadow.halo`). The glow is card-only. Buttons neither move nor cast
  a shadow: primary and danger lighten a step, and secondary takes a clear background (new
  `action.secondary.fill-hover`, using `porcelain.300` / `midnight.450`). Dialogs, toasts and
  slider thumbs hold a still shadow through the new required role `elevation.float`
  (Adventure and Neon set it equal to their lift). Confetti sets no transform at all on hover
  (`motion.still`), because an identity `translate(0,0)` still re-rasterizes the element's text.
- **Danger button reworked, in every theme.** The hazard-tape treatment (yellow ground, drifting
  black stripes, label plate) is replaced by an outline at rest that fills solid red on hover.
  `status.danger.fill` is now red with a white `on-fill`; `status.danger.stripe`, the
  `colors.yellow` primitives and the `button.danger.stripe-*` / `label-pad-*` tokens are gone.
- **Modal close button** is a compact 40px square pulled toward the corner
  (`modal.close-size`, `modal.close-inset`), instead of a full-size control pill.

- **Tabs track radius** now matches the pill (`radius.control` instead of `radius.container`)
  — 999px in Confetti, 12px in Adventure, square in Neon.

### Added

- **`WorkCard`** — an image-first project card: a media frame with category tag and index number,
  title and date beneath, as a link when given an `href`. Tokens under `work-card.*`.
- **`DarkPanel`** — a deep call-to-action block that stays dark in both modes, with every Button
  variant legible on it. Backed by the required semantic roles `surface.deep`, `text.on-deep`
  and `text.on-deep-muted` (wired to each theme's syntax inputs) and `dark-panel.*` tokens.
- **Linting.** `npm run lint` runs ESLint (TypeScript, React, hooks, a11y), Stylelint, and a new
  `audit:css` that fails component CSS reading anything but its own component tokens.
  `npm run check` runs everything CI runs, and a new `checks` workflow does so on every push and
  PR, including a check that the committed `build/portfolio/` is not stale.
- **Every component now documents every state.** `argTypes` are complete across all six —
  each prop has a typed control, a description, and its default in the props table — and
  Button, Card and Tabs gained an **All states** story.
- **`data-force` state hook.** Hover, focus and pressed cannot be triggered from a control
  or held still for a snapshot, so each component's CSS pairs its real pseudo-class with a
  matching `data-force` attribute (`.cf-button:hover, .cf-button[data-force~="hover"]`).
  Nothing sets it at runtime and the pseudo-classes remain the real trigger, so runtime
  behaviour is unchanged — but Storybook gets a **state** control and Chromatic can now
  regression-test states it previously could not reach.
- **Button `pressed` state** *(visual — new)*. The inverse of hover: the sticker settles
  back down. New `--button-transform-pressed` / `--button-shadow-pressed` /
  `--button-pressed-brightness`, over two new semantic roles (`shadow.flat`,
  `effect.brightness-rest`). It resolves to the resting values in every theme, so a theme
  that lifts collapses the lift and one that brightens drops back to no bump. Statically it
  reads the same as rest, which is the point — the button is flat again.
- **Tabs `hover` state** *(visual — new)*. An idle tab warms from muted to full-strength
  text on hover, short of the lit pill. New `--tabs-hover-fg`.
- **`syntax.*` brand-kit inputs + `color.syntax.*` roles** — a code-block ground and its two
  neutrals, per theme (Confetti deepest ink, Adventure deep forest, Neon synth-black). These
  sit on the **theme axis, not the mode axis**: a snippet is an inset terminal, deep in light
  and dark alike, so one syntax palette reads against it in both. Added to the required
  schema, so every theme must supply them.
- **`--code-*` component tokens** (`tokens/component/portfolio/code.json`) — ground, plain
  text, comments, and four syntax hues. The hues *reuse the existing accent roles* rather
  than inventing new ones: they are already tuned to be light enough to carry ink on a fill,
  which is exactly what makes them legible as text on a deep ground. Every one clears WCAG AA
  on its own theme's ground (lowest: Neon's function pink at 5.79:1).
- **`--code-inline-*` component tokens** — the `code` chip inside prose. Unlike the block,
  this one *does* follow the mode: it sits in a running line of body text, so it takes the
  panel surface a step off the page rather than the block's deep ground — a near-black chip
  mid-sentence reads as a redaction, not as code. Fixes chips that stayed near-white in dark
  mode: Storybook styles them as `.css-x :where(p:not(…)) code`, and because `:where()`
  contributes no specificity that computes to an exact tie with a plain `.sbdocs-content
  code` — a tie Storybook won, since Emotion injects at runtime.
- **Storybook docs chrome is now token-driven** (`.storybook/preview-head.html`, preview-only)
  — page surface, prose, props table, and code blocks all follow the active theme × mode, so
  a docs page shows components on the surface they actually ship on.

### Fixed

- **Foundations docs rendered empty.** They still used token names from before the rename
  (`color-text-primary`, `space-12`, `font-size-18`, ...). Mapped to current names.
- **Tabs, Slider, Switch and Overlay were partly unstyled.** Their CSS used the new
  `fill` / `text` / `border` / `horizontal` names while the token files kept `bg` / `fg` /
  `border-color` / `padding-x`. The tokens are renamed to match.
- **The Elevation docs page hard-coded a `translate(-2px, -2px)` hover**, contradicting the
  no-movement hover. It now reads the real tokens.
- **Tailwind output had no colours.** `build/portfolio/tailwind.theme.js` mapped a `color-` prefix
  that no token has had since the rename, so `colors` was empty. It now maps the semantic colour
  roles (surface, text, action, status, accent, border, icon).
- **Adventure failed AA in places**: muted, accent, danger and success text on the dark card
  (3.9–4.4:1) and two light values at 4.49–4.50:1. Retuned `forest.400` / `forest.500`,
  `bark.400` and `green.700`; every text and fill pair now clears 4.5:1 in all six theme × mode
  combinations.
- **A modal token referenced a primitive** (`modal.close-size`), failing the three-tier audit; the
  semantic `size.control-compact` (40px) fixes it.
- Stale wording across docs, stories and token comments (sticker, hard offset, cream, hazard
  tape) now describes what the system does.

- **Mode toggle only worked one way.** Changing a global makes Storybook rewrite the preview
  URL and remount the docs page, and Storybook only writes a `globals` param for values that
  differ from `initialGlobals` — so `mode:dark` was added but switching back to light never
  cleared it. The remount re-seeded `dark` from the stale URL and clobbered the correct value
  the channel had just delivered. Foundations state is now cached at module scope, which
  survives the remount.
- **Foundations specimens lost their colors.** Those pages have no stories, so no
  ThemeProvider ran and the docs `<html>` carried no `data-theme`/`data-mode`. Because a
  `var()` is substituted where a property is *declared* and the theme wiring is declared once
  under `:root`, every wired role resolved against missing inputs and computed to nothing —
  fills, borders, radii and fonts vanished while the spacing ramp kept working. The
  Foundations hook now mirrors the toolbar onto the docs root.

### Removed

- Unused dependencies `@vercel/speed-insights` and `@vitejs/plugin-react`; dead exports and the
  unused `Figure` / `Rule` helpers; the unused `slider.transition-*` and `work-card.text-muted`
  tokens.

### Internal

- One global focus ring (`src/styles/global.css`); components no longer restate it.
- Component CSS reads only component tokens: new `tabs.tab-gap`, `tab-border`, `tab-leading` and
  `slider.thumb-radius`; component-local custom properties are namespaced `--cf-*`.
- `ThemeProvider` follows its props by adjusting state during render instead of in an effect.
- Dependencies updated within their semver ranges (Storybook 10.6, React 19.3, Vite 8.3, ...).

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
