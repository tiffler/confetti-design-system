# Architecture

Confetti is **themeable** — a theme is a handful of brand-kit values, so a project can run as
many as it needs, each in **light and dark**. Three ship as worked examples (`confetti`,
`adventure`, `neon`); they are demonstrations of the contract, not the extent of it.

Theme and mode are two independent axes combined by the CSS cascade, not a per-combination
matrix: **mode** owns the neutrals, **theme** owns a small brand kit, and a theme may bring
its own neutrals per mode. Adding a theme is a few token values, never a refactor.

---

## Quick start

```bash
npm install
npm run storybook      # builds tokens, then serves Storybook on :6006
```

Storybook opens on a cover page; use the **Theme** and **Mode** switchers in the toolbar to
flip through every theme × mode combination the project defines.

| Script | What it does |
| --- | --- |
| `npm run tokens` | Layer audit → Style Dictionary build (`tokens/` → `build/portfolio/`) |
| `npm run audit:tokens` | The three-tier contract check on its own |
| `npm run storybook` | Build tokens, then the Storybook dev server on `:6006` |
| `npm run build-storybook` | Build tokens, then a static Storybook |
| `npm run typecheck` | `tsc --noEmit` |

---

## How theming works

### Three token tiers

Each tier may reference only the tier below it — enforced at build time, not by convention.

```
PRIMITIVE  ──▶  SEMANTIC  ──▶  COMPONENT
raw values      roles + a       per-widget
(the palette)   theme's inputs  values (var refs)
```

- **Primitive** (`tokens/primitives/`) — raw values: color ramps, spacing, type scale,
  radii, shadows, motion. No meaning, no theme awareness. Emitted once under `:root`.
- **Semantic** (`tokens/semantic/`, `tokens/modes/`, `tokens/themes/`, `tokens/overrides/`)
  — purpose-named roles. This includes the neutrals (per mode), the **brand-kit inputs** a
  theme sets, and the wiring that binds roles to those inputs.
- **Component** (`tokens/component/`) — per-widget values (`--button-primary-bg`,
  `--badge-bg-neutral`) that reference semantic roles only. Components consume these and
  nothing else, so they never know which theme or mode is active.

### The brand-kit contract

A theme is a small set of **inputs** — brand color, four accents, control/container radius,
border width, three fonts, and the button hover style. A `wiring` layer binds the roles
components use (e.g. `action.primary.bg`) to those inputs once, under `:root`. Override an
input in a `[data-theme]` block and every wired role repoints through the cascade — that's
how a whole theme comes from changing a handful of values.

### Independent axes

```
:root                         primitives + wiring + component tokens (var refs)
[data-mode="light|dark"]      base neutrals
[data-theme="confetti|…"]     the brand-kit inputs
[data-theme][data-mode]       a theme's own neutrals + any a11y lift
```

An element under `[data-theme="neon"][data-mode="dark"]` picks Neon's brand from the theme
block, Neon's own neutrals from its override block, and any base neutral it didn't override
from the mode block. Adding a theme adds one CSS block and multiplies nothing.

### Enforced, not documented

`npm run audit:tokens` walks every token and fails the build on: a semantic/component token
holding a raw value, a component token skipping a layer into a primitive, or a reference to
a token that doesn't exist. A companion schema check fails any theme × mode that's missing a
required role. So the architecture can't quietly rot.

---

## Runtime theming

Two root attributes drive everything:

```html
<html data-theme="neon" data-mode="dark">
```

`ThemeProvider` owns both axes. Changing either attribute repoints every consuming component
at once — pure CSS cascade, no re-render.

```tsx
import { ThemeProvider, Button } from './src';

<ThemeProvider theme="adventure" mode="dark">
  <Button variant="primary">View case study</Button>
</ThemeProvider>;
```

`theme` is an open string, so a demo can pass its own theme name (a `[data-theme]` block in
its own CSS) without touching Confetti. `target="scope"` writes the attributes to a wrapper
`<div>` instead of the document root, which lets two combinations render side by side.

---

## Components

React, one `.tsx` + `.css` + `.stories.tsx` triple each, consuming component tokens only.

- **Button** — `primary` · `secondary` · `ghost` · `danger`. Hover is per-theme: Confetti
  lifts onto a hard shadow, Adventure brightens with no lift, Neon glows. `danger` takes
  primary's footprint but fills from `status.danger` rather than the brand — so it stays red
  in a theme whose brand is not — and hazard-stripes it with a deepened step of that red.
- **Card** — eyebrow · title · body; tilts on hover by a deterministic hash of its seed (no
  `Math.random()`, so visual snapshots stay stable).
- **Badge** — four accent hues plus `success` and `neutral`, in `bold` and `subtle` tones.
  The source of truth for the pill palette, which Tabs reuses. `success` and `neutral` are
  states rather than categories, so both carry their own foregrounds instead of the shared
  accent pair — and neither appears in `TabHue`, because a tab is a category.
- **Tabs** — a segmented control: a pill group with a sliding active indicator that borrows
  Badge's palette, so a lit tab and a Badge read as one system per hue. Arrows / Home / End,
  roving `tabindex`. It renders no panels; when the panels live outside the component, a
  `panelId` per tab wires `aria-controls`, and `managePanels` will show and hide them too.
- **Overlay** — the full-viewport dim that above-the-page surfaces sit on, and the only
  place dialog behaviour is implemented. A native `<dialog>` opened with `showModal()`, so the
  focus trap, `inert`, Escape and the top layer come from the platform; the element itself
  paints `--color-scrim`, so a click that misses the content dismisses and nothing needs a
  z-index. Carries no fill, border or radius — the content brings its own.
- **Modal** — `Overlay` plus a Card-weight panel, in two widths, with header / body / footer
  slots. Reach for Overlay directly when the thing on the scrim is not a panel.
- **Toast** — a transient notification in `success` · `danger` · `neutral`. Card-weight
  paper with the tone on the leading edge and the icon rather than in a coloured fill, so the
  interior stays an ordinary surface and the ghost dismiss button matches every other one.
  Announces itself correctly (`role="alert"` for danger, `role="status"` otherwise);
  positioning, queueing and timers are the application's, as `open` is for Modal.
- **Switch** — a binary control that takes effect immediately, as opposed to a checkbox,
  which stages a value until submit. `role="switch"`, so it announces on/off; the states differ
  in track fill, thumb fill and thumb position, never colour alone. `ModeToggle` is this wired
  to `ThemeProvider` — the light/dark control the system previously expected every consumer to
  build for itself.
- **Icon** — wraps Phosphor icons at bold weight; sizes mirror the type scale; decorative by
  default (a `label` promotes it to `role="img"`).

---

## Generated output

`npm run tokens` writes four **committed** files to `build/portfolio/` (each carries a
`GENERATED FILE — do not edit` banner):

| File | For |
| --- | --- |
| `tokens.css` | The product — CSS custom properties for every theme × mode. |
| `tokens.json` | Flat index the Storybook Foundations read live, so docs can't drift. |
| `tokens.dtcg.json` | W3C DTCG format, values fully resolved — the interchange file for design tools (Figma, Tokens Studio). |
| `tailwind.theme.js` | Tailwind keys mapped to `var()` refs, so utilities follow the active theme. |

Build output is committed on purpose: the source tokens are Style Dictionary aliases that
mean nothing without a Node toolchain, so committing the resolved output lets anything
downstream read exact values. Regenerate with `npm run tokens` and commit alongside any
token change.

---

## Consuming it

- **A design tool / importer** → read `build/portfolio/tokens.dtcg.json` (resolved values,
  typed, with each token's CSS variable name under `$extensions`).
- **An app** → link `build/portfolio/tokens.css`, set `data-theme` + `data-mode`, and
  consume component tokens (`--button-primary-bg`) or semantic roles
  (`--color-text-primary`). Never primitives directly — they're the palette, not the API.

---

## Adding a theme

1. `tokens/themes/<name>.json` — the brand-kit inputs (brand, accents, shape, fonts, hover),
   referencing primitives. Define all of them; the wiring references them all.
2. *(optional)* `tokens/overrides/<name>.light.json` + `.dark.json` — the theme's own
   neutrals per mode, plus any accessibility lift.
3. Add the brand/neutral primitives to `tokens/primitives/color.json`; add `'<name>'` to
   `THEMES` in `src/theme/ThemeProvider.tsx`.
4. `npm run tokens`, then measure contrast and add a lift wherever a brand color fails AA.

No changes to component tokens, component code, or the pipeline — the build discovers themes
by reading the folder.

---

## Project structure

```
Confetti/
├─ tokens/                    authored token source (the input)
│  ├─ primitives/             raw values — color, spacing, type, radii, shadows, widths
│  ├─ semantic/
│  │  ├─ base.json            axis-independent roles (type, space, size, motion)
│  │  └─ theme-roles.json     the wiring — roles → brand-kit inputs
│  ├─ modes/                  light / dark base neutrals
│  ├─ themes/                 brand-kit inputs — confetti · adventure · neon
│  ├─ overrides/              per-theme-per-mode neutrals + a11y lifts
│  └─ component/portfolio/    button · card · badge · tabs · overlay · modal · toast · switch · icon
├─ style-dictionary/          build.js · audit-layers.js · validate-schema.js
├─ build/portfolio/           GENERATED, committed — tokens.css/json/dtcg + tailwind
├─ docs/ARCHITECTURE.md       this file
├─ public/fonts/              self-hosted Fredoka + JetBrains Mono
└─ src/
   ├─ components/             Button · Card · Badge · Tabs · Overlay · Modal · Toast · Switch · Icon
   ├─ foundations/            Storybook docs + live token specimens
   ├─ theme/ThemeProvider.tsx
   └─ Cover.stories.tsx       the Storybook landing page
```
