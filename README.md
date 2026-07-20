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
| `npm run tokens` | Style Dictionary build — `tokens/` → `build/portfolio/` |
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

### Build output

`npm run tokens` writes three files to `build/portfolio/`:

- **`tokens.css`** — primitives under `:root`, then semantic + component tokens under
  each `[data-skin][data-mode]` selector pair.
- **`tokens.json`** — the same tokens as structured data, keyed `skin.mode`. The
  Storybook Foundations pages read this, so the docs cannot drift from the build.
- **`tailwind.theme.js`** — Tailwind theme keys mapped to `var()` references, so a
  utility class follows whatever theme is active at runtime.

`build/` is generated and gitignored. Run `npm run tokens` after a fresh clone.

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

Headline face is **Fredoka**, not Bricolage Grotesque. Fredoka and JetBrains Mono are
declared with system fallbacks — the consuming app loads the actual webfonts.

> **Dark mode is pending a design pass.** The values in `confetti/dark.json` were derived
> systematically from the light comps (surface ramp inverted, red and accents lifted for
> legibility) rather than extracted from artwork. They are structurally complete and
> contrast-checked, but not art-directed.

## Deployment

Private GitHub repo → Chromatic. Chromatic publishes a public Storybook URL, linked from
the portfolio case study; the code stays private.
