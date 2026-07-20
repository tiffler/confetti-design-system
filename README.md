# 🎊 Confetti

Personal portfolio design system. Powers the portfolio site and case studies, with a
multi-skin, multi-mode token architecture built to scale.

Confetti ships one skin (`confetti`) in light and dark. The skin axis is structurally
real rather than hardcoded, so adding a skin later is a new folder — not a refactor.

```bash
npm install
npm run storybook     # builds tokens, then serves Storybook on :6006
```

| Script | What it does |
| --- | --- |
| `npm run tokens` | Layer audit, then Style Dictionary build — `tokens/` → `build/portfolio/` |
| `npm run audit:tokens` | Three-tier contract check on its own |
| `npm run storybook` | Token build, then Storybook dev server |
| `npm run build-storybook` | Token build, then static Storybook into `storybook-static/` |
| `npm run typecheck` | `tsc --noEmit` |

## Token pipeline

Three tiers, each layer only allowed to reference the one below it:

```
primitives  →  semantic  →  component
raw values     purpose        per-component
               per skin       values
               per mode
```

1. **Primitives** (`tokens/primitives/`) — raw color ramps, spacing scale, type scale,
   radii, shadows, motion, z-index. No semantic meaning, no theme awareness. Emitted
   once under `:root`; identical for every skin and mode.

2. **Semantic** (`tokens/semantic/portfolio/`) — purpose-driven aliases that reference
   primitives only. This is the only layer that varies by skin and mode.

3. **Component** (`tokens/component/portfolio/`) — component-specific values referencing
   semantic tokens only, never primitives. `--button-primary-bg`, `--card-radius`,
   `--badge-bg-teal`.

Components consume component tokens and nothing else. They never know which skin or
mode is active — the custom property name is stable, only its value repoints.

### The contract is enforced, not documented

`npm run audit:tokens` walks every token declaration and fails on:

- a semantic or component token holding a **literal** instead of an alias;
- a component token **skipping a layer** to reach a primitive;
- a reference to a token that **does not exist**.

It runs as the first step of `npm run tokens`, so a violation fails the build with the
offending token named — the same way `_schema.json` already fails a skin that omits a
required role. Schema validation checks *completeness*; this checks *discipline*.

Running it against the system as originally built found ten violations that reviewing by
eye had missed: every motion token in Button and Card reached straight past the semantic
layer into primitives, `button.ghost` inlined `transparent` twice, and dark mode's
`border.subtle` inlined an rgba value. Fixing those added a semantic motion vocabulary
(`motion.transform.lift`, `motion.duration.interaction`), a `color.border.none` role for
deliberate absence, and a `cream.a16` primitive. No rendered value changed.

The audit also reports primitives no role aliases and roles no component consumes.
Neither is a defect — primitives are a palette, and the semantic layer is the public API
for application code, not merely an input to component tokens — so they print as
information rather than failures.

### Build output

`npm run tokens` writes four files to `build/portfolio/`:

- **`tokens.css`** — primitives under `:root`, then semantic + component tokens under
  each `[data-skin][data-mode]` selector pair.
- **`tokens.json`** — the same tokens as structured data, keyed `skin.mode`. The
  Storybook Foundations pages read this, so the docs cannot drift from the build.
- **`tokens.dtcg.json`** — the same tokens in [W3C Design Tokens (DTCG)][dtcg] format,
  one group per skin+mode, values fully resolved. This is the interchange file for
  Figma, Tokens Studio, and design-tool importers.
- **`tailwind.theme.js`** — Tailwind theme keys mapped to `var()` references, so a
  utility class follows whatever theme is active at runtime.

[dtcg]: https://tr.designtokens.org/format/

**`build/portfolio/` is committed on purpose.** Generated output is normally gitignored,
but a design system exists to be consumed, and the source tokens are Style Dictionary
aliases (`{color.ink.600.value}`) that mean nothing without a Node toolchain. Committing
the resolved output means anything downstream — a design tool, another repo, an importer
reading the URL — gets exact values instead of inferring them from component CSS.

Regenerate with `npm run tokens` and commit the result alongside any token change; the
files carry a `GENERATED FILE — do not edit` banner.

## Consuming the system

For a design tool or importer, read **`build/portfolio/tokens.dtcg.json`** — resolved
values, typed, with the CSS variable name on each token under `$extensions`.

For an application, link `build/portfolio/tokens.css` and set the two root attributes:

```html
<link rel="stylesheet" href="build/portfolio/tokens.css" />
<html data-skin="confetti" data-mode="light">
```

Then consume component tokens (`--button-primary-bg`) or semantic roles
(`--color-text-primary`, `--font-size-h2`). Do not consume primitives directly — they
are the palette, not the API, and they carry no theme awareness.

## Runtime theming

Two independent root attributes:

```html
<html data-skin="confetti" data-mode="dark">
```

`ThemeProvider` owns both. It is a context provider, not per-component logic — changing
either attribute updates every consuming component at once.

```tsx
import { ThemeProvider, Button } from './src';

<ThemeProvider skin="confetti" mode="dark">
  <Button variant="primary">View case study</Button>
</ThemeProvider>;
```

`target="scope"` writes the attributes to a wrapper div instead of `documentElement`,
which is what lets two modes render side by side on one page.

Storybook exposes both axes as toolbar switchers for demo purposes. Compiled production
output is built-time themed.

## Schema

`tokens/semantic/portfolio/_schema.json` defines the semantic vocabulary every skin must
satisfy, and the build enforces it — a skin missing a required token fails
`npm run tokens` with the specific token names, rather than silently emitting a
half-themed stylesheet.

- **`required`** — every skin must define these itself. All color roles, plus `shadow.lift`.
- **`inheritable`** — typography, radii, and spacing roles. A skin may omit them and
  inherit; the base skin must define them.

**Inheritance rule:** the base skin's `light.json` (`confetti/light.json`) is the floor
that every other skin+mode deep-merges onto. That is why `confetti/dark.json` contains
only colors and a shadow — its typography, radii, and spacing come from the light file
automatically, and a change there stays consistent across modes.

## Adding a new skin

1. Create `tokens/semantic/portfolio/skins/{name}/light.json` and `dark.json`.
2. Define every token in the schema's `required` list. Override anything from
   `inheritable` you want to differ; omit the rest and it falls back to Confetti.
3. Add `'{name}'` to the `Skin` union and `SKINS` array in `src/theme/ThemeProvider.tsx`.
4. Run `npm run tokens`.

No changes to primitives, component tokens, component code, or the build pipeline —
the build discovers skins by reading the `skins/` directory. Step 3 is only there so
TypeScript and the Storybook toolbar know the new value exists.

Parked skin directions, from the design brief: **Vintage** (muted/warm/serif),
**Arcade** (neon/blocky), **Glitch** (high-contrast/chromatic aberration).

## Publishing

**Live Storybook:** https://main--6a5dbe45138c58d9d6190f4d.chromatic.com

The repo is private; the Storybook is published publicly through Chromatic. Visibility
is a Chromatic project setting (Manage → Collaborate), not something the repo controls —
a public Storybook from a private repo is the intended split.

`.github/workflows/chromatic.yml` runs on every push to `main` and on pull requests.
It runs `build-storybook` (so tokens are built first), uploads the result, and:

- **auto-accepts baselines on `main`**, so the published Storybook always tracks main;
- **reports visual diffs on PRs without failing CI** (`exitZeroOnChanges`) — diffs are
  reviewed in the Chromatic UI rather than gating the build.

Setup is done — the project exists and `CHROMATIC_PROJECT_TOKEN` is stored as a repo
secret. To rotate the token, take a new one from Chromatic's Manage screen and run:

```bash
gh secret set CHROMATIC_PROJECT_TOKEN --body "<token>"
```

To publish from your machine instead, put the same token in `CHROMATIC_PROJECT_TOKEN`
and run `npm run chromatic`.

## Folder structure

```
design-system/
├── tokens/
│   ├── primitives/          color, spacing, typography, radii, shadows
│   ├── semantic/portfolio/
│   │   ├── _schema.json     required vocabulary, enforced at build time
│   │   └── skins/confetti/  light.json, dark.json
│   └── component/portfolio/ button, card, badge
├── style-dictionary/
│   ├── build.js             loops skins × modes, validates, writes one tokens.css
│   ├── validate-schema.js
│   └── transforms/
├── build/portfolio/         GENERATED — tokens.css, tokens.json, tailwind.theme.js
├── src/
│   ├── components/          Button, Card, Badge
│   ├── foundations/         Storybook docs pages + live token specimens
│   ├── theme/               ThemeProvider
│   └── styles/global.css
└── .storybook/
```

## Design reference

Confetti's light-mode values are canonical — extracted from the Claude Design comps and
the homepage hero widget code, recorded in the
[Notion page](https://app.notion.com/p/3a3b380ae3b281f68bc6c4d61e08b421). Pull from
there rather than re-deriving.

Fredoka and JetBrains Mono are declared with system fallbacks — the consuming app loads
the actual webfonts.

> **Dark mode is pending a design pass.** The values in `confetti/dark.json` were derived
> systematically from the light comps (surface ramp inverted, red and accents lifted for
> legibility) rather than extracted from artwork. They are structurally complete and
> contrast-checked, but not art-directed.

## Deployment

Private GitHub repo → Chromatic. Chromatic publishes a public Storybook URL, linked from
the portfolio case study; the code stays private.
