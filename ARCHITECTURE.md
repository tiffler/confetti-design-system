<div align="center">

# 🎊 Confetti Design System

### Architecture Reference

*A complete, precise map of how Confetti is built — token architecture, theming, components, and the rules that hold it together.*

</div>

---

> [!NOTE]
> This document describes the system **as built**. Every value and resolution chain here
> reflects the actual source files, not a summary. It's written to be read by both humans
> and AI tools.

### ⚡ Quick facts

- 🎨 **Themes** (`confetti`, `ocean`) × **modes** (`light`, `dark`, `high-contrast`) as **two
  fully independent axes**, combined by the CSS cascade at runtime — **not** a per-combination
  matrix. MODE owns neutrals + focus; THEME owns brand/accent. Adding either is one token
  file. See the **Build Spec** §"Theme + mode architecture" for the authoritative model.
- 🧱 **Three-tier token architecture:** primitive → semantic → component, strictly enforced.
- ⚛️ **Stack:** React 19 + TypeScript · Storybook 10 · Tailwind 4 · Vite 8 · Style Dictionary 5. Builds track current stable versions — see the **Build Spec** for the version policy.
- 🔤 **Two typefaces:** Fredoka (content) + JetBrains Mono (interface).
- ✅ **Enforced, not documented:** the build fails if the layering is broken.

---

## Table of Contents

| # | Section | # | Section |
| --- | --- | --- | --- |
| 1 | [Core Concepts](#1-core-concepts) | 8 | [Accessibility](#8-accessibility) |
| 2 | [Token Architecture](#2-token-architecture) ⭐ | 9 | [Tooling](#9-tooling) |
| 3 | [Theming Model](#3-theming-model) | 10 | [File Structure](#10-file-structure) |
| 4 | [Build Pipeline](#4-build-pipeline) | 11 | [Consuming the System](#11-consuming-the-system) |
| 5 | [Type System](#5-type-system) | 12 | [Extending the System](#12-extending-the-system) |
| 6 | [Motion & Elevation](#6-motion-and-elevation) | 13 | [Invariants](#13-invariants) |
| 7 | [Components](#7-components) | | |

<details>
<summary>Full subsection list</summary>

- **2. Token Architecture** — [The three tiers](#21-the-three-tiers) · [Why it matters](#22-why-the-layering-matters) · [Primitives](#23-tier-1--primitives) · [Semantic](#24-tier-2--semantic) · [Component](#25-tier-3--component) · [Resolution example](#26-end-to-end-resolution-example) · [Enforcement](#27-enforcement-schema--layer-audit)
- **3. Theming** — [Runtime attributes](#31-runtime-attributes) · [ThemeProvider](#32-themeprovider) · [Inheritance](#33-inheritance-the-deep-merge-floor)
- **4. Build** — [Inputs/outputs](#41-inputs-and-outputs) · [Artifacts](#42-generated-artifacts) · [Why output is committed](#43-why-build-output-is-committed)
- **7. Components** — [Button](#71-button) · [Card](#72-card) · [Badge](#73-badge) · [Icon](#74-icon)

</details>

---

## 1. Core Concepts

### 1.1 Two independent axes: theme and mode

Confetti's appearance is controlled by **two orthogonal axes**:

| Axis | Meaning | Values | Attribute |
| --- | --- | --- | --- |
| 🎨 **theme** | Brand / visual identity | `confetti` | `data-theme` |
| 🌗 **mode** | Light or dark rendering | `light`, `dark` | `data-mode` |

- They're **independent** — any theme can render in either mode.
- Today there's one theme, but the axis is **structurally real, not hardcoded**. Adding a
  theme is a new folder plus one union member — never a refactor.

```html
<html data-theme="confetti" data-mode="dark">
```

> [!IMPORTANT]
> **On the `data-theme` convention.** In parts of the web ecosystem `data-theme` holds
> `light`/`dark`. Here it holds the **brand** axis and `data-mode` holds light/dark. This
> is deliberate and internally consistent: *theme = identity, mode = rendering.*

### 1.2 Vocabulary

- **Token** — a named design decision (a color, size, radius, duration…).
- **Primitive** — a raw, theme-independent value.
- **Semantic token** — a purpose-named alias that varies per theme + mode.
- **Component token** — a per-component value the CSS actually consumes.
- **Resolution chain** — the path a component token follows down to a literal value.

---

## 2. Token Architecture

> [!TIP]
> ⭐ **This is the heart of the system.** Everything else is downstream of it. If you read
> one section, read this one.

### 2.1 The three tiers

Tokens live in three strictly-ordered layers. **Each layer may only reference the layer
directly below it.**

```
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │ PRIMITIVES  │ ◀── │  SEMANTIC   │ ◀── │  COMPONENT  │
  │ raw values  │     │  purpose    │     │ per-widget  │
  │ theme-indep │     │ per theme   │     │  values     │
  │             │     │ per mode    │     │             │
  └─────────────┘     └─────────────┘     └─────────────┘
   #c40000            color.action        --button-primary-bg
                      .primary.bg
```

| Tier | Directory | May reference | Emitted as | Theme-aware? |
| --- | --- | --- | --- | --- |
| **Primitive** | `tokens/primitives/` | other primitives only | `:root { … }` | ❌ No |
| **Semantic** | `tokens/semantic/portfolio/themes/<theme>/<mode>.json` | primitives only | `[data-theme][data-mode] { … }` | ✅ Yes |
| **Component** | `tokens/component/portfolio/*.json` | semantic only | `[data-theme][data-mode] { … }` | ✅ Indirectly |

**The rule, stated three ways:**

- A **semantic** token never holds a literal and never references a component token.
- A **component** token never holds a literal and never reaches past semantic into a primitive.
- A **primitive** may reference other primitives but never anything above it.

### 2.2 Why the layering matters

It exists to answer one question cleanly: **"where do I change X, and what does it
affect?"** Each tier is the right edit-point for a different *kind* of change.

| You want to… | Edit at tier | Blast radius |
| --- | --- | --- |
| Shift a raw hue everywhere it's used | 🧱 Primitive | Everything referencing that primitive |
| Change what *"primary action"* means | 🎯 Semantic | Every component using that role — both modes tracked separately |
| Retune **one** component | 🧩 Component | That component only |

Concretely:

- **Change `color.red.500` (`#c40000`)** → every semantic role pointing at it moves: accent
  text, primary button, ghost hover. One edit, system-wide.
- **Repoint `color.action.primary.bg`** from red to teal → only *actions* change; accent
  text stays red. The word "primary" is decoupled from the hue.
- **Change `--button-radius`** → only buttons change; cards and badges untouched.

> [!NOTE]
> Without the layering, a hex buried in a component is *simultaneously* "the brand red,"
> "the primary-action color," and "this button's background" — and you can't change one
> meaning without changing all three. The tiers give each meaning **its own name and its
> own edit-point.**

**A second payoff — theming is free:**

- Components consume component tokens; only the semantic layer varies by theme + mode.
- A component never knows which theme is active. The custom-property **name** is stable;
  only its **value** repoints.
- Dark mode is a different semantic *file*, not different component *code*.

### 2.3 Tier 1 — Primitives

> Raw values. Theme-independent. Emitted once under `:root`. Located in `tokens/primitives/`.

<details open>
<summary><b>🎨 Color</b> — <code>color.json</code></summary>

**Cream** (warm off-whites — light surfaces):

| Token | Value | Role hint |
| --- | --- | --- |
| `color.cream.100` | `#f4f0e4` | lightest — raised surfaces |
| `color.cream.200` | `#ede7d8` | panel chrome |
| `color.cream.300` | `#ede4d3` | page background baseline |
| `color.cream.a16` | `rgba(237, 228, 211, 0.16)` | cream @ 16% — dark-mode subtle border |

**Ink** (warm near-blacks). **Numbered strictly by luminance: 200 lightest → 900 darkest.**

| Token | Value | Note |
| --- | --- | --- |
| `color.ink.200` | `#bfb6a6` | lightest |
| `color.ink.300` | `#6b5f4a` | |
| `color.ink.400` | `#3b3121` | |
| `color.ink.500` | `#332a1c` | |
| `color.ink.600` | `#2e2618` | **canonical Ink** — text & borders |
| `color.ink.700` | `#2a2317` | |
| `color.ink.800` | `#211b12` | |
| `color.ink.900` | `#1a150d` | darkest |
| `color.ink.a12 / a18 / a24` | `rgba(46,38,24, …)` | translucent inks (`.12`, `.18`, `.24`) |

**Red** (brand): `color.red.500` = `#c40000` (canonical) · `color.red.400` = `#e33b2e`
(lifted for dark).

**Accent hues** — four hues, three stops each (`100` tint · `400` mid · `700` deep):

| Hue | `100` | `400` | `700` |
| --- | --- | --- | --- |
| 🟣 purple | `#f0e5f2` | `#c6adda` | `#453552` |
| 🟢 teal | `#e4f1ec` | `#a8d6cb` | `#2c463f` |
| 🟠 orange | `#fbf0dc` | `#f0c07a` | `#54401f` |
| 🌸 pink | `#f5e4ea` | `#e8b8cd` | `#4d323c` |

**Base:** `color.base.white` = `#ffffff` · `color.base.transparent` = `transparent`.

</details>

> [!IMPORTANT]
> The ink ramp is **monotonic by number** — a higher number is *always* darker. This is an
> invariant: the numbering must never lie about ordering.

<details>
<summary><b>📏 Spacing</b> — <code>spacing.json</code></summary>

A 4px grid:

`0` · `1`=4px · `2`=8px · `3`=12px · `4`=16px · `5`=20px · `6`=24px · `8`=32px · `10`=40px · `12`=48px · `16`=64px · `20`=80px.

</details>

<details>
<summary><b>🔤 Typography</b> — <code>typography.json</code></summary>

**Two typefaces only.** Everything after the first name in each stack is a load-time
fallback, not a third face.

- `font.family.fredoka` → `Fredoka, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- `font.family.mono` → `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`

**Sizes** — named by pixel value, every step on the 4px grid:

- `font.size.12 … 48` (12, 14, 16, 20, 24, 32, 40, 48)
- `font.size.hero` = `clamp(36px, 13cqw, 104px)` — fluid, above the fixed ramp

**Weights:** `medium`=500 · `semibold`=600 · `bold`=700
**Tracking:** `tight`=-0.03em · `normal`=0 · `wide`=0.16em
**Leading:** `none`=1 · `snug`=1.3 · `normal`=1.5

</details>

<details>
<summary><b>⬜ Radii & border widths</b> — <code>radii.json</code></summary>

- `radius.none`=0 · `xs`=2px · `sm`=4px · `md`=8px · `full`=999px · `circle`=50%
- `border.width.hairline`=1px · `border.width.sticker`=2px *(the thick-outline look)*

</details>

<details>
<summary><b>✨ Shadows, motion, z-index</b> — <code>shadows.json</code></summary>

- `shadow.hard-ink` = `3px 3px 0 {color.ink.600}` — the hard "sticker lift," no blur.
  `shadow.hard-cream` is its dark-mode counterpart. *(A primitive referencing another
  primitive — the only allowed intra-tier reference.)*
- `motion.lift` = `translate(-2px, -2px)` · `motion.rest` = `translate(0, 0)` ·
  `motion.tilt.subtle` = `0.8deg`
- `motion.duration.fast`=120ms / `base`=180ms · `motion.easing.standard` = `cubic-bezier(0.2, 0, 0.2, 1)`
- `z.base`=0 · `raised`=10 · `sticky`=100 · `overlay`=1000

</details>

### 2.4 Tier 2 — Semantic

> Purpose-named aliases. **The only layer that varies by theme and mode**, and the only
> layer application code should consume by name.
> Path: `tokens/semantic/portfolio/themes/<theme>/<mode>.json`.

`confetti/light.json` defines the full vocabulary. `confetti/dark.json` overrides **only
what changes** (colors + shadow); everything else inherits.

**Color roles** (light value → dark value):

| Role | 🌕 Light | 🌑 Dark |
| --- | --- | --- |
| `color.surface.page` | `cream.300` `#ede4d3` | `ink.800` `#211b12` |
| `color.surface.raised` | `cream.100` `#f4f0e4` | `ink.700` `#2a2317` |
| `color.surface.panel` | `cream.200` `#ede7d8` | `ink.500` `#332a1c` |
| `color.surface.card` | `base.white` `#ffffff` | `ink.400` `#3b3121` |
| `color.text.primary` | `ink.600` `#2e2618` | `cream.300` `#ede4d3` |
| `color.text.muted` | `ink.300` `#6b5f4a` | `ink.200` `#bfb6a6` |
| `color.text.inverse` | `base.white` | `ink.600` |
| `color.text.accent` | `red.500` `#c40000` | `red.400` `#e33b2e` |
| `color.border.default` | `ink.600` | `cream.300` |
| `color.border.subtle` | `ink.a12` | `cream.a16` |
| `color.border.none` | `transparent` | `transparent` |
| `color.action.primary.bg` | `red.500` | `red.400` |
| `color.action.primary.fg` | `base.white` | `ink.900` |
| `color.action.secondary.bg` | `cream.300` | `ink.500` |
| `color.action.secondary.fg` | `ink.600` | `cream.300` |
| `color.action.ghost.bg` | `transparent` | `transparent` |
| `color.action.ghost.fg` | `ink.600` | `cream.300` |
| `color.action.ghost.fg-hover` | `red.500` | `red.400` |
| `color.accent.<hue>.subtle` | hue `100` (tint) | hue `700` (deep) |
| `color.accent.<hue>.bold` | hue `400` | hue `400` |
| `color.accent.on-bold` | `ink.600` | `ink.600` |
| `color.accent.on-subtle` | `ink.600` | `cream.300` |

> [!NOTE]
> **Why `on-bold` / `on-subtle` are separate roles:** they're the foregrounds that stay
> legible against each end of an accent pair. In light mode both are ink; in dark mode a
> *subtle* accent becomes a deep hue, so its foreground flips to cream while *bold* keeps
> ink. Two roles because they diverge by mode.

**Non-color roles:**

- 🔤 **Typography** — `font.family.display`/`body` = Fredoka, `font.family.label` = mono.
  `font.size.h1…h6` (48/40/32/24/20/16), `body`=16, `body-secondary`=14, `label`=12.
  `font.weight.display`=600, `body`=500, `control`=700, `label`=700.
- ⬜ **Radius** — `control`=full (pills/buttons), `container`=md (cards), `chip`=xs, `avatar`=circle.
- 📐 **Border** — `border.width.default` = sticker (2px).
- 📏 **Size** — `size.control`=48px (control height), `size.icon.sm/md/lg`=16/20/24px
  *(mirrors the type scale, not the space scale)*.
- 📊 **Space** — two families over one primitive ramp (every primitive is adopted, so
  nothing consumes a raw primitive). **Component:** `inset-xs`=4, `inline`/`inset-tight`=8,
  `inset-sm`=12, `stack`=16, `inset-lg`=20, `inset`=24. **Layout:** `stack-lg`=32,
  `layout-sm`=40, `layout`=48, `layout-lg`=64, `layout-xl`=80. Plus `none`=0.
- ✨ **Motion** — `motion.transform.lift/rest`, `motion.tilt.max`=0.8deg,
  `motion.duration.interaction`=180ms, `motion.easing.interaction`=standard.

> [!TIP]
> **Naming note:** semantic motion leaf names deliberately differ from the primitives they
> alias (`motion.transform.lift` → `motion.lift`). A semantic role sharing a primitive's
> *full* path would collide in the flat CSS custom-property namespace.

### 2.5 Tier 3 — Component

> Per-component values CSS consumes directly. Every value references a semantic token.
> One file per component in `tokens/component/portfolio/`: `button`, `card`, `badge`, `icon`.

Example — `button.json` (abridged):

```jsonc
{
  "button": {
    "radius":      { "value": "{radius.control.value}" },
    "font-family": { "value": "{font.family.label.value}" },        // JetBrains Mono
    "font-size":   { "value": "{font.size.body-secondary.value}" }, // 14px
    "font-weight": { "value": "{font.weight.control.value}" },      // 700
    "tracking":    { "value": "{font.tracking.label.value}" },      // 0.16em
    "min-height":  { "value": "{size.control.value}" },             // 48px
    "primary": { "bg": { "value": "{color.action.primary.bg.value}" }, … },
    "ghost":   { "bg":     { "value": "{color.action.ghost.bg.value}" },
                 "border": { "value": "{color.border.none.value}" } }
  }
}
```

> [!IMPORTANT]
> **No literals** — even "transparent" is expressed through the semantic
> `color.action.ghost.bg` / `color.border.none` roles, so a future theme can decide what
> "no border" means.

### 2.6 End-to-end resolution example

Trace `--button-primary-bg` through all three tiers, in both modes:

```
🧩 COMPONENT   button.primary.bg   = {color.action.primary.bg}
🎯 SEMANTIC    color.action.primary.bg
                 (light) = {color.red.500}  →  🧱 #c40000
                 (dark)  = {color.red.400}  →  🧱 #e33b2e
```

Emitted CSS:

```css
:root { --color-red-500: #c40000; --color-red-400: #e33b2e; /* …primitives… */ }

[data-theme="confetti"][data-mode="light"] {
  --color-action-primary-bg: #c40000;
  --button-primary-bg:       #c40000;
}
[data-theme="confetti"][data-mode="dark"] {
  --color-action-primary-bg: #e33b2e;
  --button-primary-bg:       #e33b2e;
}
```

The component's CSS only ever writes `background: var(--button-primary-bg)`. It resolves to
the right value automatically from the active `data-theme` / `data-mode`.

### 2.7 Enforcement: schema + layer audit

> [!IMPORTANT]
> The architecture is **not** a convention you must remember — **the build fails if it's
> violated.** Two independent checks run before every token build.

**1️⃣ Schema completeness** — `validate-schema.js` + `_schema.json`

- Every theme must define every `required` semantic role.
- `inheritable` roles (typography, radii, spacing, motion, size) may be omitted and inherit
  from the base theme's light file.
- A theme missing a required role fails with the specific token names.

**2️⃣ Layer discipline** — `audit-layers.js` (`npm run audit:tokens`, and step 1 of `npm run tokens`)

Walks every declaration and fails on:

- ❌ a semantic/component token holding a **literal**;
- ❌ a component token **skipping a layer** into a primitive;
- ❌ a reference to a token that **doesn't exist**.

```console
$ npm run audit:tokens
Tokens: 84 primitive · 67 semantic · 69 component
✓ three-tier contract holds: no literals below primitives, no layer skipping
```

> [!NOTE]
> Schema validation checks *completeness*; the layer audit checks *discipline*. When first
> written, the audit found **ten real violations** (motion tokens reaching into primitives;
> `button.ghost` inlining `transparent` twice; dark mode inlining an rgba). All were fixed
> by adding the missing semantic roles — with **zero change to any rendered value.**

---

## 3. Theming Model

### 3.1 Runtime attributes

Two root attributes switch everything at once, matching the emitted CSS selectors:

```html
<html data-theme="confetti" data-mode="dark">
```

Every themed token is emitted under `[data-theme="…"][data-mode="…"]`, so changing either
attribute repoints every custom property. **No re-render logic — pure CSS cascade.**

### 3.2 ThemeProvider

`src/theme/ThemeProvider.tsx` — a React context provider owning both axes:

```tsx
import { ThemeProvider, Button } from './src';

<ThemeProvider theme="confetti" mode="dark">
  <Button variant="primary">View case study</Button>
</ThemeProvider>;
```

- **Exports:** types `Theme` (`'confetti'`) and `Mode` (`'light' | 'dark'`); constants
  `THEMES`, `MODES`.
- **`useTheme()`** → `{ theme, mode, setTheme, setMode, toggleMode }`.
- **`target` prop** — `'root'` (default) writes to `documentElement`; `'scope'` writes to a
  wrapper `<div>`, which lets two modes render side by side on one page.

### 3.3 Inheritance: the deep-merge floor

The base theme's **light** file is the floor every other theme + mode merges onto — which
is why `dark.json` contains only colors and a shadow:

```
build inputs for confetti/dark:
  [ confetti/light.json  (floor) ]  ⊕  [ confetti/dark.json  (overrides) ]
   → full token set: dark values where dark.json specifies, light values everywhere else
```

- A typography change made once in `light.json` stays consistent across both modes — no
  duplication.
- A theme author writes **only what actually differs.**

---

## 4. Build Pipeline

### 4.1 Inputs and outputs

`npm run tokens` runs `style-dictionary/build.js`, which:

1. 🔍 Runs the layer audit (fails the build on violation).
2. 📁 Loads the schema and discovers themes by reading the `themes/` directory.
3. 🌱 Emits primitives once under `:root`.
4. 🔀 For each theme × mode: deep-merges the light floor + mode overrides, validates against
   the schema, emits semantic + component tokens under `[data-theme][data-mode]`.
5. 💾 Writes four artifacts (below).

### 4.2 Generated artifacts

All written to `build/portfolio/`:

| File | Purpose |
| --- | --- |
| 🎨 `tokens.css` | The runtime stylesheet — primitives under `:root`, themed tokens under each `[data-theme][data-mode]` pair. |
| 📦 `tokens.json` | Structured data keyed `theme.mode`. The Storybook Foundations pages read this, so docs can't drift from the build. |
| 🔁 `tokens.dtcg.json` | **W3C Design Tokens (DTCG)** format, values fully resolved, CSS var name under `$extensions`. The interchange file for Figma / Tokens Studio / importers. |
| 💨 `tailwind.theme.js` | Tailwind keys → `var()` references, so a utility class follows the active theme+mode. |

### 4.3 Why build output is committed

> [!NOTE]
> `build/portfolio/` is committed **on purpose** (unusual for generated files).

- A design system exists to be *consumed*, and the source tokens are Style Dictionary
  aliases (`{color.ink.600.value}`) that mean nothing without a Node toolchain.
- Committing resolved output means any downstream consumer — a design tool, another repo, an
  importer reading the URL — gets **exact values** instead of inferring them.
- Regenerate with `npm run tokens` and commit alongside any token change. The files carry a
  `GENERATED FILE — do not edit` banner.

---

## 5. Type System

A **1.25 modular scale** rounded to the 4px grid. Six heading levels, all Fredoka at
heading leading — the ramp is pure size.

| Role | Size | Notes |
| --- | --- | --- |
| `font-size-display` | `clamp(36px, 13cqw, 104px)` | hero only, fluid |
| `font-size-h1` | **48px** | |
| `font-size-h2` | 40px | |
| `font-size-h3` | 32px | |
| `font-size-h4` | 24px | ← card titles |
| `font-size-h5` | 20px | |
| `font-size-h6` | 16px | equals body — face & weight carry the distinction |
| `font-size-body` | **16px** | body primary |
| `font-size-body-secondary` | 14px | captions, metadata, dense UI |
| `font-size-label` | 12px | mono eyebrows, uppercase |

**Two typefaces, two jobs:**

- **Fredoka** → voice and content (display + body).
- **JetBrains Mono** → interface and metadata (labels, buttons, badges, eyebrows) — always
  uppercase, 0.16em tracking.

---

## 6. Motion and Elevation

> [!NOTE]
> Confetti has **no blur-based elevation.** Depth comes from two mechanisms.

1. 🪜 **A surface ramp** — `page` → `raised` → `panel` → `card`, four distinct surfaces (not
   opacity variants).
2. 🎯 **A hard offset shadow on hover** — `shadow.lift` = `3px 3px 0 {ink}` paired with
   `translate(-2px, -2px)`. In dark mode the shadow repoints to cream (a dark shadow on a
   dark surface reads as nothing), so the *token* changes, not the component.

Interactive cards additionally **tilt on hover** (see [§7.2](#72-card)). All transforms and
transitions are tokens and are dropped under `prefers-reduced-motion: reduce`.

---

## 7. Components

> [!IMPORTANT]
> All components consume **component tokens only** — never semantic, never primitive, never
> literal. Each is a `.tsx` + `.css` + `.stories.tsx` triple under `src/components/`.

### 7.1 Button

**`variant`:** `primary` · `secondary` · `ghost`

- 🔤 **Type** — JetBrains Mono, 14px, weight 700, **uppercase**, 0.16em tracking.
- 📐 **Height** — 48px (`min-height` via `size.control`; `box-sizing: border-box` so the
  transparent-bordered `ghost` measures the same 48px as the outlined variants).
- 🖍️ **Border** — all variants carry the 2px ink border (transparent for `ghost`). Primary
  and secondary differ by **fill**, not outline, so the hover shadow extrudes from a real edge.
- ✨ **Hover** — primary + secondary lift onto the hard ink shadow; ghost only shifts text to
  red. Dropped under reduced-motion.

### 7.2 Card

**Slots:** optional mono `eyebrow` · display-face `title` (h4/24px) · `body`.
**Props:** `surface` (`card`|`raised`), `interactive`, `seed`, `tilt`.

- 🎴 **Tilt (signature behavior)** — interactive cards sit **square at rest** and **turn
  slightly on hover**, like a sticker being lifted and set back down.
- 🎲 **Deterministic, not random** — the angle is derived from a **hash of the card's seed**
  (its title by default), *never* `Math.random()`. Random angles would flag every card as
  changed in every Chromatic snapshot; hashing also beats `:nth-child`, which would
  re-assign angles when a filter reorders the grid.
- 🧮 The hash is **FNV-1a with an avalanche step** (a naive `h*31+c` bunched similar titles
  onto the same few angles). Hover always **crosses to the opposite side of flat** — crossing
  reads as intentional placement; leaning further reads as drift.
- 📐 Bounds `±0.8°`. `tilt={0}` keeps a card square through the lift. Reduced-motion drops
  the tilt with the lift.

### 7.3 Badge

- **4 hues** (`purple`, `teal`, `orange`, `pink`) × **2 tones** (`bold`, `subtle`).
- Mono, uppercase, weight 700, wide tracking.
- Foreground is `accent.on-bold` / `accent.on-subtle` so it stays legible against each tone
  in both modes.

### 7.4 Icon

Wraps [Phosphor](https://phosphoricons.com) (`@phosphor-icons/react`) rather than
re-exporting it, so the system owns the decisions an icon set must make consistently.

```tsx
import { ArrowRight } from '@phosphor-icons/react';
import { Icon } from './src';
<Icon icon={ArrowRight} size="md" />;
```

- ⚖️ **Weight fixed at `bold`** — matches the 2px sticker linework (a `weight` prop exists as
  a rare escape hatch).
- 📏 **Sizes mirror the type scale** — `sm` 16 · `md` 20 · `lg` 24 (via `size.icon.*`), so an
  icon matches adjacent text's cap height.
- 🎨 **Colour inherits** by default (`tone="inherit"` → `currentColor`); `default` / `muted` /
  `accent` are explicit escapes.
- ♿ **Decorative by default** — no `label` → `aria-hidden`; a `label` promotes it to
  `role="img"`. So an arrow beside "View case study" isn't announced twice.
- 🌳 Passed as a **component value** (`icon={ArrowRight}`), not a name string, so bundlers
  tree-shake to what's used.

---

## 8. Accessibility

- 📊 **Contrast is measured, not assumed** — `src/foundations/contrast.ts` implements WCAG
  2.1 math with correct alpha compositing. A translucent token is flattened onto its backdrop
  first, so `ink.a12` reports its real ~1.5:1 against cream, not a false 14.9:1 against solid ink.
- 🚫 The **Color** page renders live samples and **only shows a foreground on a surface if it
  clears 4.5:1** — documenting a failure by printing illegible text would just add
  inaccessible text to the page.
- ✅ **Light mode passes AA** across all rendered text.
- 🎛️ Motion respects `prefers-reduced-motion`. Icons carry correct `aria-hidden` / `role`.

> [!WARNING]
> **Dark mode is derived, not art-directed.** `confetti/dark.json` values were derived
> *systematically* from the light comps (surface ramp inverted, red + accents lifted), not
> extracted from artwork. It's structurally complete but **pending a design pass**, with a
> few sub-AA accent combinations still flagged. This is stated in the token file itself.

---

## 9. Tooling

- 📚 **Storybook 10** (`react-vite`) — Foundations pages read live from `tokens.json`; toolbar
  exposes theme + mode switchers.
- 🖼️ **Chromatic** — visual regression on every push to `main` and every PR. `main`
  auto-accepts baselines; PRs surface a visual diff for review.
- 🔤 **Self-hosted webfonts** — Fredoka + JetBrains Mono `.woff2` in `public/fonts/`, loaded
  via `preview-head.html` with `font-display: block`. Self-hosted (not a CDN) because visual
  regression testing must not depend on a third-party request that could land mid-capture.
- ✅ **Layer audit + schema validation** gate every token build.

**Scripts:**

| Script | Does |
| --- | --- |
| `npm run tokens` | Layer audit → Style Dictionary build → 4 artifacts |
| `npm run audit:tokens` | Three-tier contract check only |
| `npm run storybook` | Build tokens, serve Storybook on :6006 |
| `npm run build-storybook` | Build tokens, static Storybook |
| `npm run typecheck` | `tsc --noEmit` |

---

## 10. File Structure

```
tokens/
  _schema.json                    # required neutral + brand vocabulary (build-time check)
  primitives/                     # 🧱 Tier 1 — raw values, axis-independent
    color · spacing · typography · radii · shadows .json
  semantic/
    base.json                     # 🎯 Tier 2, axis-independent — type, space, radius, motion (→ :root)
  modes/                          # 🎯 Tier 2, MODE axis — neutrals (→ [data-mode])
    light · dark · high-contrast .json
  themes/                         # 🎯 Tier 2, THEME axis — brand/accent (→ [data-theme])
    confetti · ocean .json
  exceptions/                     # 🛟 documented a11y overrides (→ [data-theme][data-mode])
    confetti.dark · ocean.dark .json
  component/portfolio/            # 🧩 Tier 3 — per-component values, emitted as var() refs
    button · card · badge · icon .json

style-dictionary/
  build.js                        # the pipeline
  audit-layers.js                 # three-tier enforcement
  validate-schema.js              # completeness enforcement
  transforms/index.js             # custom formats/transforms

src/
  theme/ThemeProvider.tsx         # theme + mode context
  components/{Button,Card,Badge,Icon}/*.{tsx,css,stories.tsx}
  foundations/                    # Storybook docs + live specimens
    Color · Typography · Spacing · Elevation .mdx
    Specimens.tsx · tokens.ts · contrast.ts
  styles/global.css
  index.ts                        # package entry — components + theme API

build/portfolio/                  # ✅ committed generated artifacts (see §4.3)
  tokens.css · tokens.json · tokens.dtcg.json · tailwind.theme.js

.storybook/                       # main.ts · preview.tsx · preview-head.html
public/fonts/                     # self-hosted woff2 + fonts.css
```

---

## 11. Consuming the System

**🎨 A design tool / importer** → read `build/portfolio/tokens.dtcg.json`. Resolved values,
typed, with each token's CSS variable name under `$extensions`.

**💻 An application** → link the stylesheet and set the two attributes:

```html
<link rel="stylesheet" href="build/portfolio/tokens.css" />
<html data-theme="confetti" data-mode="light">
```

Then consume:

- ✅ **Component tokens** (`--button-primary-bg`) or **semantic roles**
  (`--color-text-primary`, `--font-size-h2`).
- ❌ **Never primitives directly** — they're the palette, not the API, and carry no theme
  awareness.

---

## 12. Extending the System

<details open>
<summary><b>🎨 Add a theme</b></summary>

1. Create `tokens/semantic/portfolio/themes/<name>/light.json` and `dark.json`.
2. Define every `required` role; override any `inheritable` role you want to differ, omit the
   rest (they fall back to Confetti).
3. Add `'<name>'` to the `Theme` union and `THEMES` array in `ThemeProvider.tsx`.
4. `npm run tokens`. The build discovers the theme by reading the directory — **no changes to
   primitives, component tokens, component code, or the pipeline.**

</details>

<details>
<summary><b>🧩 Add a component</b></summary>

1. Add `tokens/component/portfolio/<name>.json` referencing semantic roles only.
2. Add `src/components/<Name>/<Name>.{tsx,css,stories.tsx}` consuming those component tokens.
3. Export from `src/index.ts`. Run `npm run tokens` — the layer audit confirms the new tokens
   obey the contract.

</details>

<details>
<summary><b>🎟️ Add a token</b></summary>

Define the primitive (if the raw value is new) → alias it in the semantic layer with a
purpose name → reference that from the component layer. **Never shortcut the middle.**

</details>

---

## 13. Invariants

> [!IMPORTANT]
> These must always hold. ★ = enforced by the build.

- ⭐ No semantic or component token holds a literal value.
- ⭐ Component → semantic → primitive references only; primitives reference at most other
  primitives.
- ⭐ Every theme defines every `required` semantic role.
- 🎨 The ink ramp is monotonic by number (200 lightest → 900 darkest).
- 📐 Every type size and control size lands on the 4px grid.
- 🔤 Only two typefaces exist; everything else in a font stack is a fallback.
- 🔀 Components never read `data-theme` / `data-mode` — they consume stable custom-property
  names whose values repoint.
- 💾 Generated `build/portfolio/` is regenerated and committed with any token change; never
  hand-edited.
- 🏗️ The base theme's `light.json` is the deep-merge floor; mode/theme files override only
  what differs.

---

<div align="center">

*This document describes the system as built. When the code changes, update it — or
regenerate the relevant sections from the token files, which are the source of truth.*

🎊

</div>
