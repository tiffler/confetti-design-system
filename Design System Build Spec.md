# Confetti Design System — Build Spec

> **Purpose.** This is the *as-built* build/tooling specification for the Confetti design
> system: the toolchain, the versions, the **version policy**, the token build pipeline, and
> how to reproduce and upgrade it. It is the build-side companion to **`ARCHITECTURE.md`**,
> which documents the token architecture, theming model, and component design in depth. When
> this document and `ARCHITECTURE.md` overlap, this one is authoritative on *tooling and
> build*; `ARCHITECTURE.md` is authoritative on *architecture and design*.
>
> Rebuilt from this document alone, the system's build would come out the same.

---

## Table of contents

1. [Overview](#1-overview)
2. [Version & upgrade policy](#2-version--upgrade-policy) ← **read this first**
3. [Toolchain & current versions](#3-toolchain--current-versions)
4. [Environment & prerequisites](#4-environment--prerequisites)
5. [Project structure](#5-project-structure)
6. [Token build pipeline (Style Dictionary)](#6-token-build-pipeline-style-dictionary)
7. [Theme + mode architecture (independent axes)](#7-theme--mode-architecture-independent-axes)
8. [Generated artifacts](#8-generated-artifacts)
9. [Tailwind 4 integration](#9-tailwind-4-integration)
10. [Storybook 10 setup](#10-storybook-10-setup)
11. [Theming (ThemeProvider)](#11-theming-themeprovider)
12. [Components](#12-components)
13. [Foundations & accessibility](#13-foundations--accessibility)
14. [Commands](#14-commands)
15. [Tooling upgrade log](#15-tooling-upgrade-log)
16. [Verification & invariants](#16-verification--invariants)
17. [Consuming the system](#17-consuming-the-system)

---

## 1. Overview

Confetti is a **multi-theme, multi-mode design system** built around a **three-tier token
architecture** (primitives → semantic → component). Its job is to be a **stable, versioned
source of design tokens** — emitted as CSS custom properties plus JSON/DTCG/Tailwind exports
— consumed by the portfolio site and documented/tested in Storybook + Chromatic.

- **Token pipeline:** authored JSON in `tokens/` → **Style Dictionary** → `build/portfolio/`
  (`tokens.css`, `tokens.json`, `tokens.dtcg.json`, `tailwind.theme.js`).
- **Components:** React (Button, Card, Badge, Icon), each a `.tsx` + `.css` + `.stories.tsx`
  triple consuming **component tokens only**.
- **Docs & QA:** Storybook (Foundations pages read live from `tokens.json`) + Chromatic
  visual regression.
- **Consumer:** the portfolio pulls `build/portfolio/tokens.css` + fonts from `main` via a
  sync script — so the *committed build output* is the product.

---

## 2. Version & upgrade policy

> **Policy: every build uses the latest *current-stable* version of each dependency that is
> *mutually compatible* with the rest of the toolchain.** "Latest that's compatible" — not
> "latest at any cost," and never a pre-release, preview, or RC in a normal build.

This is a deliberate, standing rule, not a one-time cleanup. Concretely:

1. **Track current stable.** When a dependency ships a new stable major/minor, upgrade to it
   as part of normal maintenance — don't let the stack drift a major behind (which is how it
   started; see [§15](#15-tooling-upgrade-log)).
2. **Compatibility gates "latest."** Some packages cap others. The chain here:
   - **Storybook is the anchor.** `@storybook/builder-vite` declares the **supported Vite
     range** (currently `^5 || ^6 || ^7 || ^8`), and the Storybook **framework** version
     gates the supported **React** range. So **Storybook + React + Vite move as one
     coordinated upgrade** — you cannot bump Vite or React past what the installed Storybook
     supports.
   - `@vitejs/plugin-react` must match the Vite major.
   - `@tailwindcss/postcss` tracks the `tailwindcss` major.
3. **Never adopt a preview/RC as "latest."** If npm's `latest` dist-tag points at a stable
   release whose ecosystem hasn't caught up, hold at the previous stable and document why.
   **Current exception — TypeScript:** npm `latest` is the **7.x native (Go) compiler
   rewrite**, but the Storybook `react-docgen-typescript` toolchain is not yet verified
   against it, so TypeScript is intentionally held at the **latest 5.x** (5.9). Revisit when
   the docgen/build tooling supports TS 7. (Tailwind 4 and React 19, by contrast, *are*
   verified against this toolchain and are adopted.)
4. **The byte-identical invariant governs every tooling change.** A tooling upgrade must
   leave `build/portfolio/tokens.css` **byte-for-byte identical** (verified by diff) unless a
   *token value* was deliberately changed. Tooling must never silently alter the output the
   portfolio consumes. See [§16](#16-verification--invariants).
5. **Verify before merging.** Every upgrade must pass, on a branch:
   `npm run tokens` (byte-identical) · `npm run typecheck` · `npm run build-storybook` — then
   **re-baseline Chromatic** so any intentional visual shift (e.g. a Tailwind preflight
   change) is reviewed, not silently accepted.

### How to upgrade (runbook)

```bash
git checkout -b upgrade-tooling
cp build/portfolio/tokens.css /tmp/tokens.pre        # snapshot for the diff
npx storybook@latest upgrade --yes                    # Storybook + codemods (imports, config)
# then bump the coordinated set to current stable:
#   react react-dom @types/react @types/react-dom @vitejs/plugin-react vite
#   tailwindcss @tailwindcss/postcss  (+ style-dictionary, chromatic, postcss)
npm install
npm run tokens && diff -q /tmp/tokens.pre build/portfolio/tokens.css   # MUST be identical
npm run typecheck
npm run build-storybook
# review Chromatic diff, re-baseline on main
```

Remove packages the codemods orphan (e.g. `@storybook/addon-essentials`, `@storybook/blocks`,
`@storybook/preview-api` were folded into core `storybook` at v9+), and drop anything the
upgrade tool auto-adds that you don't want (it added `@storybook/addon-mcp`, which was
removed).

---

## 3. Toolchain & current versions

As-built, current stable + compatible (upgraded 2026-07-22 — see [§15](#15-tooling-upgrade-log)):

| Package | Version | Role / notes |
|---|---|---|
| **style-dictionary** | `5.5.0` | Token build engine. v5 is ESM-only; references use **no `.value` suffix** (`{color.ink.600}`). |
| **storybook** | `10.5.3` | Core (CLI + former essentials addons folded in). **Anchor** of the version chain. |
| **@storybook/react-vite** | `10.5.3` | Framework (React renderer + Vite builder). Story/preview types import from here. |
| **@storybook/addon-docs** | `10.5.3` | Autodocs + MDX blocks (`@storybook/addon-docs/blocks`). |
| **react / react-dom** | `19.2.8` | Component runtime. |
| **@types/react / @types/react-dom** | `19.2.x` | React 19 types (stricter: no implicit `children`, ref-as-prop). |
| **vite** | `8.1.5` | Dev/build bundler — v8 uses the **Rolldown** (Rust) bundler. |
| **@vitejs/plugin-react** | `6.0.4` | React plugin, matched to Vite 8. |
| **tailwindcss** | `4.3.3` | Utility layer + preflight. v4 = CSS-first (`@import "tailwindcss"`). |
| **@tailwindcss/postcss** | `4.3.3` | Tailwind's own PostCSS plugin (replaces the `tailwindcss` plugin; autoprefixer no longer needed). |
| **postcss** | `8.5.21` | PostCSS runtime for the Tailwind plugin. |
| **typescript** | `5.9.3` | **Held at latest 5.x** — 7.x native compiler pending toolchain support (see [§2](#2-version--upgrade-policy)). |
| **chromatic** | `18.1.0` | Visual-regression CLI. |
| **@phosphor-icons/react** | `2.1.10` | Icon source (peer `react >= 16.8`, so React 19-safe). |

Removed in the upgrade (folded into core or unnecessary): `@storybook/addon-essentials`,
`@storybook/blocks`, `@storybook/preview-api`, `@storybook/react` (now transitive via
`react-vite`), `@storybook/addon-mcp`, `autoprefixer`.

---

## 4. Environment & prerequisites

- **Node:** `engines.node = "^20.19.0 || >=22.12.0"` — the floor Vite 8 requires. (Dev
  machine runs Node 25.x, which satisfies it.)
- **Package manager:** npm (a committed `package-lock.json` is the source of truth).
- **`type: "module"`** — the whole repo is ESM (Style Dictionary 5 is ESM-only; all build
  scripts are `import`/`export`).

---

## 5. Project structure

```
Confetti/
├─ package.json                    # scripts, deps, engines
├─ postcss.config.js               # @tailwindcss/postcss
├─ tailwind.config.js              # imports build/portfolio/tailwind.theme.js
├─ tsconfig.json
├─ ARCHITECTURE.md                 # architecture/design reference (deep)
├─ Design System Build Spec.md     # this file (build/tooling reference)
├─ .storybook/
│  ├─ main.ts                      # framework + addons (addon-docs) + staticDirs
│  └─ preview.tsx                  # theme/mode toolbar globals + ThemeProvider decorator
├─ tokens/                         # AUTHORED token source (the input)
│  ├─ _schema.json                 # required neutral + brand vocabulary (build-time check)
│  ├─ primitives/                  # Tier 1 — color, spacing, typography, radii, shadows (→ :root)
│  ├─ semantic/base.json           # Tier 2, axis-independent — type/space/radius/motion (→ :root)
│  ├─ modes/                       # Tier 2, MODE axis — light/dark/high-contrast (→ [data-mode])
│  ├─ themes/                      # Tier 2, THEME axis — confetti/ocean (→ [data-theme])
│  ├─ exceptions/                  # a11y overrides — <theme>.<mode>.json (→ [data-theme][data-mode])
│  └─ component/portfolio/         # Tier 3 — button/card/badge/icon (→ :root as var() refs)
├─ style-dictionary/
│  ├─ build.js                     # the pipeline (see §6)
│  ├─ audit-layers.js              # three-tier contract enforcement
│  ├─ validate-schema.js           # semantic completeness enforcement
│  └─ transforms/index.js          # custom filters + formats
├─ build/portfolio/                # GENERATED, COMMITTED output (the product)
│  ├─ tokens.css · tokens.json · tokens.dtcg.json · tailwind.theme.js
├─ public/fonts/                   # self-hosted Fredoka + JetBrains Mono .woff2
└─ src/
   ├─ index.ts                     # public entry (components + theme)
   ├─ theme/ThemeProvider.tsx
   ├─ components/{Button,Card,Badge,Icon}/*.{tsx,css,stories.tsx}
   └─ foundations/                 # Color/Typography/Spacing/Elevation .mdx + Specimens/tokens/contrast
```

---

## 6. Token build pipeline (Style Dictionary)

**Entry:** `npm run tokens` = `audit:tokens` (three-tier contract) → `node
style-dictionary/build.js`. The build (`style-dictionary/build.js`) is a multi-pass
Style Dictionary 5 program:

The build emits **one CSS block per axis value** (not per combination) — see the axis model
in [§7](#7-theme--mode-architecture-independent-axes). Passes:

1. **Register** filters + formats (`transforms/index.js`), load `tokens/_schema.json`,
   discover `modes/*` and `themes/*` from the folders.
2. **`:root`** — two passes: primitives + `semantic/base.json` (resolved literals), then
   **component tokens as `var()` references** (`confetti/css-declarations-refs`), so they
   compose the active mode+theme at runtime.
3. **One `[data-mode]` block per mode** (source = primitives + base + that mode file, filter
   `confetti/mode`) and **one `[data-theme]` block per theme** (filter `confetti/theme`) —
   each a self-contained set of resolved literals.
4. **One `[data-theme][data-mode]` block per exception file** (`confetti/exception`).
5. **Resolved index** — for each theme×mode, a flat build (primitives + base + mode + theme +
   any exception + component) validated by `validateTheme(...)` and stored in `tokens.json`;
   `tailwind.theme.js` + `tokens.dtcg.json` derive from it.

**Custom filters/formats** (`transforms/index.js`): one filter per layer, selected by file
path (`confetti/primitives|base|mode|theme|component|exception`) so each lands in its own
selector; `confetti/css-declarations` (resolved literals), `confetti/css-declarations-refs`
(`{ref}` → `var(--ref)` for component tokens), `confetti/json-flat`. All read DTCG-style
accessors (`token.$value ?? token.value`).

**Gates** (both fail the build):
- `audit-layers.js` — the **three-tier contract**: no literals below primitives, no layer
  skipping (component → semantic → primitive). The semantic layer now spans
  `semantic/base` + `modes/` + `themes/` + `exceptions/`.
- `validate-schema.js` — every **required** neutral + brand role resolves for every theme×mode.

> **Style Dictionary 5 note.** v5 dropped the legacy `.value` reference suffix. All token
> references are `{group.name}` (e.g. `{color.ink.600}`), never `{color.ink.600.value}`.
> The two shadow primitives that reference colours were migrated accordingly; output stayed
> byte-identical.

---

## 7. Theme + mode architecture (independent axes)

> This is the **authoritative** model. `ARCHITECTURE.md`'s older prose (§2.4, §3.3, §4.3)
> still describes the previous combined-matrix/deep-merge approach and is superseded here.

**Two independent axes, combined by the CSS cascade at runtime — never a per-combination
matrix.** `data-mode` and `data-theme` are set separately on the root element; an element
under `[data-theme="ocean"][data-mode="dark"]` picks ocean's brand from the theme block and
dark's neutrals from the mode block, with zero `ocean×dark` file authored.

| Axis | Governs | Values | Attribute | Token input |
|---|---|---|---|---|
| **MODE** | Neutrals — surfaces, text, borders, accent tint-surfaces + their foregrounds, hover shadow, **focus ring** | `light`, `dark`, `high-contrast` | `data-mode` | `tokens/modes/*.json` |
| **THEME** | Brand/accent — `text.accent`, `action.primary`, ghost hover, the 4 bold accent hues | `confetti`, `ocean` | `data-theme` | `tokens/themes/*.json` |

**Token tiers (as-built):**

1. **Primitives** (`tokens/primitives/`) — raw values → `:root`.
2. **Base semantic** (`tokens/semantic/base.json`) — axis-independent roles (type, space,
   radius, motion) → `:root`.
3. **Mode semantic** (`tokens/modes/`) → `[data-mode="…"]`. **Theme semantic**
   (`tokens/themes/`) → `[data-theme="…"]`.
4. **Component** (`tokens/component/portfolio/`) — emitted **once** under `:root` as **`var()`
   references** (`--button-primary-bg: var(--color-action-primary-bg)`). This is what makes
   the axes compose at runtime instead of multiplying into a matrix.
5. **Exceptions** (`tokens/exceptions/<theme>.<mode>.json`) → `[data-theme][data-mode]`
   (specificity 0,2,0 beats the single-axis blocks) — **only** where a brand colour fails
   WCAG AA in a specific mode (see [§7.3](#73-accessibility-exceptions)).

### 7.1 What each axis owns (exact roles)

Every colour role belongs to **exactly one axis** (the reason there is no matrix). Non-colour
semantics (type/space/radius/motion) are axis-independent and live in `semantic/base.json`.

**MODE roles** (`tokens/modes/{light,dark,high-contrast}.json`) — neutrals:

| Role | light | dark | high-contrast |
|---|---|---|---|
| `color.surface.page/raised/panel/card` | creams | inks | all `#ffffff` |
| `color.text.primary` | `#2e2618` | `#ede4d3` | `#000000` |
| `color.text.muted` | `#6b5f4a` | `#bfb6a6` | `#000000` (no greys) |
| `color.text.inverse` | white | ink | white |
| `color.border.default` | ink | cream | `#000000` |
| `color.border.subtle` | ink @12% | cream @16% | `#000000` (solid) |
| `color.action.secondary.bg/fg` | cream / ink | ink.500 / cream | white / black |
| `color.action.ghost.bg/fg` | transparent / ink | transparent / cream | transparent / black |
| `color.accent.{hue}.subtle` (tint surface) | `X.100` pale | `X.700` deep | `#ffffff` (tint dropped) |
| `color.accent.on-bold / on-subtle` | ink / ink | ink / cream | black / black |
| `shadow.lift` | `3px 3px 0 ink` | `… cream` | `… black` |
| `focus.ring.width / color / offset` | 2px / ink / 2px | 2px / cream / 2px | **4px** / black / 2px |

**THEME roles** (`tokens/themes/{confetti,ocean}.json`) — brand/accent:

| Role | confetti | ocean |
|---|---|---|
| `color.text.accent` (brand) | `#c40000` | `#0a5c74` |
| `color.action.primary.bg` | `#c40000` | `#0a5c74` |
| `color.action.primary.fg` | `#ffffff` | `#ffffff` |
| `color.action.ghost.fg-hover` | `#c40000` | `#0a5c74` |
| `color.accent.{purple,teal,orange,pink}.bold` | pastel hues | pastel hues (shared) |

> **Why some things sit where they do.** `action.secondary` is a *paper* button — its fill is
> a surface, so it's a **mode** neutral, not brand. The accent **bold** hues are the theme's
> identity (theme axis); the accent **subtle tints** are tinted *surfaces* that must deepen in
> dark and drop in HC, so they're **mode**. The two current themes share the decorative bold
> hues (the "confetti" dots are a shared brand element); a theme is free to override them by
> pointing at different primitives — that's the only change needed.

### 7.2 CSS output & runtime resolution

`tokens.css` is emitted as **one block per axis value**, not per combination:

```css
:root { /* primitives + base semantic (resolved literals) */ }
:root { /* component tokens as var() refs:  --button-primary-bg: var(--color-action-primary-bg) */ }
[data-mode="light"] { /* neutrals */ }        [data-mode="dark"] { … }   [data-mode="high-contrast"] { … }
[data-theme="confetti"] { /* brand/accent */ }   [data-theme="ocean"] { … }
[data-theme="confetti"][data-mode="dark"] { /* exception override only */ }
[data-theme="ocean"][data-mode="dark"]    { … }
```

Selector count = `2 :root + 3 modes + 2 themes + 2 exceptions` for **6 rendered combinations**
(vs. 6 full matrix blocks before, growing multiplicatively). Adding a 3rd theme = +1 block,
not +3.

**Worked resolution** — a primary button under `<html data-theme="ocean" data-mode="dark">`:
`--button-primary-bg` (from `:root`) = `var(--color-action-primary-bg)` → resolved on the
element by the cascade: `[data-theme="ocean"]` sets it to `#0a5c74`; no mode block or
exception touches it, so the button fills ocean blue. Meanwhile `--color-surface-page` comes
from `[data-mode="dark"]` (`#211b12`) and `--color-text-accent` from the
`[data-theme="ocean"][data-mode="dark"]` **exception** (`#57c2dd`, specificity 0,2,0 beats the
theme block's 0,1,0). No file authored the ocean×dark pairing except the one exception.

### 7.3 Accessibility exceptions

For every theme's brand/accent, contrast is measured against **every** mode's background/text
— a brand that passes in one mode is **not** assumed to pass in another; each is checked
individually. Where a brand colour falls below **4.5:1**, an explicit
`[data-theme][data-mode]` override is added in `tokens/exceptions/<theme>.<mode>.json`,
documented in the file with the failing and achieved ratio. The base theme value is **never**
edited to fix one mode. Only **dark** mode needed overrides — full report in
[§15.1](#151-accessibility-exception-report).

### 7.4 High-contrast mode (component behaviour, not just tokens)

High-contrast is treated as partly a component problem, per the requirement that state is
never conveyed by colour alone:

- **Badges never rely on hue.** `.cf-badge` always carries a border
  (`--badge-border-color` = `border.default` → solid black in HC), so category reads from
  border + text label. The decorative **subtle** tint collapses to solid white in HC (the
  low-alpha decorative background is removed), leaving a bordered white chip.
- **Focus ring is token-driven off the mode axis** — `--focus-ring-width/color/offset`: 2px
  ink/cream in light/dark, **4px solid black** in high-contrast. Wired in `Button.css`
  (`.cf-button:focus-visible`) and a global `:focus-visible` in `global.css` (with a fallback
  so it works before the tokens load).
- **No low-alpha neutrals** — `border.subtle` and `text.muted` collapse to solid black; no
  translucent edges or muted greys survive in HC.

**Zero hardcoded values in components** — every value in the component CSS resolves to a
`var(--token)` (colours, spacing, radius, border width, focus). Verified by inspection.

### 7.5 Runtime (`ThemeProvider`) & adding an axis value

`src/theme/ThemeProvider.tsx` writes `data-theme` + `data-mode` (to `documentElement` for
`target="root"`, or a wrapper `<div>` for `target="scope"`, which lets two combinations
render side by side). It exports `THEMES` (`confetti`, `ocean`), `MODES`
(`light`, `dark`, `high-contrast`), the `Theme`/`Mode` unions, and `toggleMode` (cycles all
modes). Storybook's toolbar maps `THEMES`/`MODES`, so new values appear automatically.

**Adding a theme** = one `tokens/themes/<name>.json` + one entry in `THEMES`/`Theme`. **Adding
a mode** = one `tokens/modes/<name>.json` + one entry in `MODES`/`Mode`. Then run the contrast
check and add any exception files the report surfaces. Nothing else changes — that is the
payoff of independent axes.

---

## 8. Generated artifacts

All four are **committed** to `build/portfolio/` (the portfolio consumes them directly; a
consumer that can't run this build still gets exact values). All carry a `GENERATED FILE — do
not edit` banner.

| File | Format | For |
|---|---|---|
| `tokens.css` | CSS custom properties — primitives under `:root`, semantic+component under `[data-theme][data-mode]` | The primary product; the portfolio imports this. |
| `tokens.json` | Flat index keyed `theme.mode` → `{ name: { value, path, comment } }` | Storybook Foundations read this live so docs can't drift from the build. |
| `tokens.dtcg.json` | W3C **DTCG** format, nested, `$value`/`$type`/`$description` + `$extensions.com.confetti.cssVariable`; **values fully resolved** | Figma / Tokens Studio / importers. |
| `tailwind.theme.js` | `{ colors, spacing, borderRadius, fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, boxShadow, zIndex }`, each a `var()` reference | Tailwind consumers — utilities resolve against the active theme+mode at runtime. |

---

## 9. Tailwind 4 integration

Tailwind is used for preflight + optional token-mapped utilities (the components themselves
use plain CSS + tokens, so utility usage is currently minimal).

- **PostCSS** (`postcss.config.js`): the single plugin `@tailwindcss/postcss` (v4's own
  plugin). `autoprefixer` was removed — v4 handles vendor prefixing internally via Lightning
  CSS.
- **CSS entry** (`src/styles/global.css`): the v3 `@tailwind base/components/utilities`
  triple is replaced by one **`@import "tailwindcss";`**, plus **`@config
  "../../tailwind.config.js";`** so the generated token→utility theme still applies.
- **`tailwind.config.js`** is unchanged: it `extend`s the theme from
  `build/portfolio/tailwind.theme.js`. Under v4's `@config`, this legacy JS config
  (content + theme) is honoured.

> Upgrading Tailwind changes preflight vs v3, which can produce **intentional** Storybook
> visual diffs — expected, and reviewed via Chromatic on the upgrade.

---

## 10. Storybook 10 setup

- **`.storybook/main.ts`** — `framework: '@storybook/react-vite'`; `addons:
  ['@storybook/addon-docs']` (in v9+ the former "essentials" — controls, actions, viewport,
  backgrounds, etc. — are built into core `storybook`, so only docs is listed);
  `staticDirs: ['../public']` (serves `/fonts/*`); stories glob `../src/**/*.{mdx,stories.@(ts|tsx)}`.
- **`.storybook/preview.tsx`** — types import from `@storybook/react-vite`. Declares two
  toolbar `globalTypes` axes (**theme**, **mode**) mirroring `data-theme`/`data-mode`, an
  `initialGlobals` of `{ theme: 'confetti', mode: 'light' }`, and a **decorator** that wraps
  every story in `<ThemeProvider>` + a surface frame. Story sort pins Foundations first.
- **Type imports (post-v9):** stories use `import type { Meta, StoryObj } from
  '@storybook/react-vite'`; MDX uses `@storybook/addon-docs/blocks`; preview-side APIs use the
  `storybook/preview-api` subpath (e.g. `foundations/tokens.ts` reads the addons channel).
- **Autodocs:** driven by the `autodocs` tag on stories (the old `main.ts` `docs.autodocs`
  key was removed by the v10 migration).

---

## 11. Theming (ThemeProvider)

- Runtime is driven by **two independent attributes**: `data-theme="confetti|ocean"` and
  `data-mode="light|dark|high-contrast"`. `tokens.css` scopes neutrals to `[data-mode]` and
  brand/accent to `[data-theme]` (component tokens are `var()` refs under `:root`), so setting
  either attribute re-resolves everything via the cascade — no combined selector except the
  documented exceptions. Full model in [§7](#7-theme--mode-architecture-independent-axes).
- **`src/theme/ThemeProvider.tsx`** writes both attributes (`target="root"` → `documentElement`;
  `target="scope"` → wrapper `<div>`, for two combinations side by side) and exports `THEMES`,
  `MODES`, the `Theme`/`Mode` unions, `setTheme`/`setMode`/`toggleMode`. Storybook's toolbar
  and the portfolio drive the same two axes.

---

## 12. Components

Each is a `.tsx` + `.css` + `.stories.tsx` triple under `src/components/`, consuming
**component tokens only**. Full design detail in `ARCHITECTURE.md` §7.

- **Button** — `variant`: `primary` · `secondary` · `ghost`. Mono/uppercase, 48px height, 2px
  ink border (transparent for ghost); primary+secondary lift onto a hard offset shadow on
  hover, ghost only reddens its label.
- **Card** — slots `eyebrow`/`title`/`body`; props `surface`, `interactive`, `seed`, `tilt`.
  Interactive cards sit square at rest and **tilt on hover by a deterministic hash of the
  seed** (never `Math.random()`, so Chromatic snapshots are stable), bounded `±0.8°`.
- **Badge** — 4 hues × 2 tones (bold/subtle); mono uppercase; foreground = `accent.on-*` for
  legibility in both modes.
- **Icon** — wraps `@phosphor-icons/react`; weight fixed at `bold`; sizes `sm/md/lg`
  (16/20/24) mirror the type scale; colour inherits by default; **decorative by default**
  (no `label` → `aria-hidden`, `label` → `role="img"`); icon passed as a component value for
  tree-shaking.

---

## 13. Foundations & accessibility

- **Foundations pages** (`src/foundations/*.mdx` + `Specimens.tsx` + `tokens.ts`) render
  **live from `tokens.json`**, so documentation cannot drift from the build output.
- **Contrast is measured** (`contrast.ts`, WCAG 2.1 with correct alpha compositing). The
  Color page only renders a foreground on a surface **if it clears 4.5:1**.
- **Light mode passes AA.** **Dark mode is systematically derived, not art-directed** — it's
  structurally complete but pending a design pass, with a few sub-AA accent combinations
  flagged in the token file. See `ARCHITECTURE.md` §8.

---

## 14. Commands

| Command | Does |
|---|---|
| `npm run tokens` | Layer audit → Style Dictionary build → the 4 artifacts. |
| `npm run audit:tokens` | Three-tier contract check only. |
| `npm run storybook` | Build tokens, then serve Storybook on `:6006`. |
| `npm run build-storybook` | Build tokens, then a static Storybook. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run chromatic` | Publish to Chromatic (`--exit-zero-on-changes`). |

---

## 15. Tooling upgrade log

### 2026-07-22 — bring the whole toolchain to current stable

The project was scaffolded (2026-07-20) on a stack that was already 1–2 majors behind. This
upgrade brought everything to current stable + compatible, per [§2](#2-version--upgrade-policy).

| Package | From | To | Notes |
|---|---|---|---|
| style-dictionary | 4.4.0 | **5.5.0** | ESM-only; stripped `.value` from all references. Output **byte-identical**. |
| storybook + framework | 8.6.14 | **10.5.3** | Via `storybook upgrade` codemods: import migrations, `addon-essentials`→core, renderer→framework, removed `docs.autodocs`. |
| react / react-dom | 18.3.1 | **19.2.8** | + `@types/react(-dom)` 19. Typecheck clean. |
| vite | 5.4.11 | **8.1.5** | Rolldown bundler; `@vitejs/plugin-react` 4→**6**. Storybook 10 builder supports Vite ^8. |
| tailwindcss | 3.4.17 | **4.3.3** | `@import "tailwindcss"` + `@config`; PostCSS plugin → `@tailwindcss/postcss`; dropped autoprefixer. |
| typescript | 5.7.2 | **5.9.3** | Held below the 7.x native compiler pending docgen/toolchain support. |
| chromatic / postcss | 18.0.1 / 8.4.49 | 18.1.0 / 8.5.21 | Patch/minor. |
| Node `engines` | `>=20` | `^20.19.0 \|\| >=22.12.0` | Vite 8 floor. |

**Cleanup:** removed orphaned/auto-added packages (`@storybook/addon-essentials`,
`@storybook/blocks`, `@storybook/preview-api`, `@storybook/addon-mcp`, `autoprefixer`);
migrated `foundations/tokens.ts` to `storybook/preview-api`; deleted a stray iCloud
`settings.local 2.json`.

**Verified:** `tokens.css` byte-identical vs pre-upgrade · `tsc --noEmit` clean ·
`build-storybook` succeeds on Storybook 10 + React 19 + Vite 8 + Tailwind 4.

### 15.1 Accessibility exception report

Independent theme+mode axes shipped (`confetti`/`ocean` × `light`/`dark`/`high-contrast`).
Every theme's brand was measured against every mode. **Only dark mode needed overrides** —
and only for *brand-as-text* (`text.accent` + `ghost.fg-hover`); the primary **button fill**
keeps white text at 6.3:1 / 7.5:1 in every mode, so no fill override was needed.

| Theme × mode | What failed | Base ratio | Override | Result |
|---|---|---|---|---|
| **confetti × light** | — | 4.97:1 (accent), 6.27:1 (button) | none | pass |
| **confetti × dark** | `text.accent` (red `#c40000`) as text on `#211b12` | **2.72:1** ✗ | → `red.300` `#f04b3a` | **4.69:1** ✓ |
| **confetti × high-contrast** | — | 6.27:1 (red on white) | none | pass |
| **ocean × light** | — | 5.95:1 (accent), 7.51:1 (button) | none | pass |
| **ocean × dark** | `text.accent` (blue `#0a5c74`) as text on `#211b12` | **2.27:1** ✗ | → `blue.400` `#57c2dd` | **8.26:1** ✓ |
| **ocean × high-contrast** | — | 7.51:1 (blue on white) | none | pass |

Overrides live in `tokens/exceptions/{confetti,ocean}.dark.json` and emit under
`[data-theme][data-mode]`. Accent-on-bold/on-subtle foregrounds and dark subtle tints were
also checked and all pass (7.4–13.2:1) — no override needed.

### 15.2 Independent theme + mode axes (architecture change)

Replaced the combined theme×mode **matrix** (one full token set per pairing, dark deep-merged
onto light) with **two independent axes** combined by the CSS cascade — see [§7](#7-theme--mode-architecture-independent-axes). Summary of the change:

| Before | After |
|---|---|
| 1 theme (`confetti`) × 2 modes (`light`/`dark`), full block per pairing | 2 themes (`confetti`,`ocean`) × 3 modes (`light`,`dark`,`high-contrast`), 1 block per axis value |
| `semantic/portfolio/themes/confetti/{light,dark}.json` (deep-merge floor) | `semantic/base.json` + `modes/*` + `themes/*` + `exceptions/*` |
| Component tokens resolved to literals per pairing | Component tokens emitted once as `var()` refs |
| Mode-specific brand baked into the dark file | Documented `[data-theme][data-mode]` exceptions only |

New this pass: **high-contrast mode** (black-on-white, 4px focus, badge borders, no low-alpha),
the **ocean** theme, a build that emits per-axis blocks + a `var()`-ref component format, an
updated layer audit (`modes`/`themes`/`exceptions` count as semantic), and a rewritten
`_schema.json`. **Verified:** `audit:tokens` + schema pass; `tsc` clean; `build-storybook`
compiles; all 6 combinations render (spot-checked ocean×dark and confetti×high-contrast in
Storybook, all 6 resolve in `tokens.json`).

---

## 16. Verification & invariants

Every build / upgrade must hold these:

1. **Tokens byte-identical.** `build/portfolio/tokens.css` (and the other three artifacts) do
   not change from a tooling-only upgrade. Verify: snapshot before, `npm run tokens`, `diff`.
   The only reason the output may change is a deliberate **token value** edit.
2. **Three-tier contract holds.** `audit:tokens` passes — no literals below primitives, no
   layer skipping (the semantic layer spans `base` + `modes` + `themes` + `exceptions`).
3. **Schema complete.** Every required neutral + brand role resolves for every theme×mode.
4. **Independent axes, no matrix.** No `<theme>×<mode>` file exists except the documented
   `exceptions/`; component tokens emit as `var()` refs, not resolved per combination.
5. **Every theme×mode renders.** Confirmed by *rendering*, not config: `build-storybook`
   compiles all stories, and each combination is loaded in Storybook via
   `?globals=theme:<t>;mode:<m>` (the resolved `tokens.json` index also proves all combos
   resolve). Don't consider an axis change done on a config check alone.
6. **Contrast exceptions documented.** Any `[data-theme][data-mode]` override exists only for
   a measured AA failure and records the failing + achieved ratio in its token file
   (see [§15.1](#151-accessibility-exception-report)).
7. **Typecheck clean.** `tsc --noEmit` passes.
8. **Storybook builds.** `build-storybook` succeeds; Chromatic re-baselined for any
   intentional visual change.
9. **Deterministic snapshots.** No `Math.random()`/`Date.now()` in rendered component output
   (card tilt is a hash) — so Chromatic diffs mean real changes.

> **Note on invariant #1 (byte-identical tokens):** it applies to *tooling-only* upgrades. The
> theme+mode rearchitecture and the spacing-scale expansion are deliberate **token/output**
> changes, so `tokens.css` intentionally changed there. `confetti`+`light` values are
> preserved, so the portfolio (which consumes that combination) does not shift.

---

## 17. Consuming the system

The **portfolio** (`_Portfolio`) does **not** install this package. It syncs the committed
build output from GitHub `main`:

- `scripts/sync-tokens.mjs` fetches `build/portfolio/tokens.css` + `public/fonts/*` from
  `raw.githubusercontent.com/tiffler/confetti-design-system/main/...` on every `dev`/`build`,
  with a graceful offline fallback to the committed copies.
- **To change the portfolio's look, push the design system to `main`** — the next portfolio
  dev/build pulls it in. This is why the byte-identical invariant ([§16](#16-verification--invariants))
  matters: a tooling change must never move what downstream consumes.

See the portfolio's own `Portfolio Build Spec.md` for the consumer side.
