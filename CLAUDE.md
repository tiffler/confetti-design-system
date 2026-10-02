# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Confetti is a React + CSS design system whose real product is a **token pipeline**. `docs/ARCHITECTURE.md` is the authoritative design document — read it before making structural changes. This file covers the operational rules that aren't obvious from the source.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run tokens` | Layer audit → Style Dictionary build. `tokens/` → `build/portfolio/`. |
| `npm run audit:tokens` | Three-tier contract check alone (fast; use while iterating on tokens). |
| `npm run storybook` | Builds tokens, then serves Storybook on `:6006` (`STORYBOOK_PORT=<n>` to move it). |
| `npm run build-storybook` | Builds tokens, then a static Storybook into `storybook-static/`. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint (TS, React, hooks, a11y) + Stylelint + `audit:css`. |
| `npm run audit:css` | Component CSS reads only component tokens; nothing reads a variable that doesn't exist. |
| `npm run check` | `tokens` + `typecheck` + `lint` — everything CI runs. Run it before committing. |

There is **no test runner**. Verification is `npm run check` (CI runs the same, plus a check that the committed `build/portfolio/` is not stale — `.github/workflows/checks.yml`) and Chromatic visual snapshots (`.github/workflows/chromatic.yml`, runs `build-storybook` on push to `main` and every PR).

**Always read the exit code, not just the last line of output.** `npm run tokens` prints its summary after the audit, so a failing audit can scroll away — a layering violation once shipped to `main` that way.

## The token pipeline

### Regenerate and commit generated output

`build/portfolio/` is **generated but committed on purpose** (see `.gitignore` — `build/*` is ignored, `build/portfolio/` is un-ignored). Any change under `tokens/` must be followed by `npm run tokens`, and the four regenerated files (`tokens.css`, `tokens.json`, `tokens.dtcg.json`, `tailwind.theme.js`) committed in the same change. Never hand-edit them; they carry a `GENERATED FILE — do not edit` banner.

`src/styles/global.css` imports `build/portfolio/tokens.css`, and `src/foundations/tokens.ts` imports `build/portfolio/tokens.json` — so a stale build shows up as wrong colors in Storybook and wrong numbers in the Foundations docs.

### The three-tier contract is enforced, not advisory

`style-dictionary/audit-layers.js` exits non-zero (failing `npm run tokens`) on:

- a semantic or component token holding a literal instead of a reference,
- a component token referencing a primitive (layer skipping),
- a reference to a token that doesn't exist.

Allowed reference targets by layer: primitive → primitive; semantic → primitive or semantic; component → semantic only. "Semantic" is one tier spread across `tokens/semantic/`, `tokens/modes/`, `tokens/themes/`, and `tokens/overrides/` — the split is by *what varies*, not by tier.

The audit's "unused primitive / unused semantic role" notices are informational, not failures. Don't delete things to silence them.

### Adding a required semantic role

`tokens/_schema.json` lists roles that every theme × mode combination must resolve. `style-dictionary/validate-schema.js` runs during the build and throws for the specific `theme (mode)` that's missing one. Adding a name to `required` means supplying it in **every** mode file and/or through every theme's brand-kit inputs — otherwise the build breaks for the combinations you didn't touch.

**Isolation.** Adventure and Neon bring their own neutrals and shadows through `tokens/overrides/`. A new role that a *mode* file defines would otherwise leak Confetti's value into them, so when you add one (as `elevation.float` and `action.secondary.fill-hover` were) set it in every theme's override files too — for a theme that should not change, as an alias of the role it already used (`{elevation.lift}`). Verify by diffing the resolved `build/portfolio/tokens.json` before and after: only the theme you meant to change should differ.

### How the CSS is emitted

Two independent axes composed by the cascade, never a matrix. `style-dictionary/build.js` emits:

- `:root` — primitives + base semantic as **resolved literals**; then theme wiring and component tokens as **`var()` references** (`confetti/css-declarations-refs`). The var-ref emission is the whole trick: component tokens are written once and resolve against whichever `data-theme` / `data-mode` is live.
- `[data-mode="…"]` — neutrals per mode.
- `[data-theme="…"]` — the brand-kit inputs.
- `[data-theme][data-mode]` — a theme's own neutrals plus documented a11y lifts, from `tokens/overrides/<theme>.<mode>.json` (the filename *is* the selector — the build discovers overrides by reading the directory).

Themes and modes are discovered by directory listing. A new theme file is picked up with no pipeline edit; it does need `'<name>'` added to `THEMES` in `src/theme/ThemeProvider.tsx` to appear in the Storybook toolbar.

## Component conventions

- One directory per component holding `X.tsx` + `X.css` + `X.stories.tsx`, plus `tokens/component/portfolio/x.json`.
- CSS classes are BEM-ish under a `cf-` prefix: `.cf-button`, `.cf-button--primary`, `.cf-button__spinner`.
- **Component CSS may only read component tokens** (`var(--button-primary-fill)`), plus `--cf-*` custom properties the component sets itself (e.g. `--cf-slider-fraction`, set inline from TSX). Never a semantic role, never a primitive, never a literal color/size. That's what keeps a component ignorant of theme and mode — and `npm run audit:css` enforces it. If a component needs a value no token provides, add a component token; don't reach past it.
- **Don't restate the focus ring.** `src/styles/global.css` owns the one `:focus-visible` rule (and its `data-force="focus"` snapshot hook). A surface where it vanishes repoints `--focus-ring-color` (see `DarkPanel`).
- **Hover that doesn't move sets no transform at all** — use `motion.still` (`none`), not an identity `translate(0,0)`: an identity transform is still a transform change, which re-rasterizes the element's text by a subpixel.
- **Hover is a theme decision.** Components read `--*-shadow-hover` / `--*-transform-hover` tokens and never assume a lift, a glow or a tilt.
- New components must be exported from `src/index.ts` (component + its types).
- Story titles follow `Components/<Name>` and `Pages/<Name>`; ordering is set by `storySort` in `.storybook/preview.tsx`.
- Accessibility is part of the component, not the story: `role`/`aria-*` on the element, keyboard handling in the component. Several components carry dev-only `console.warn` guards behind `import.meta.env.DEV` (see `Button.warnIfUnnamedIconButton`) — follow that pattern rather than documenting the requirement.

### Keep renders deterministic

Chromatic diffs every story. Anything nondeterministic in render output flags as a visual change on every build. `Card` hashes its `seed` prop to pick a tilt angle specifically to avoid `Math.random()`; the token build likewise takes no timestamps. Don't introduce random or time-dependent values into rendered markup.

## Theming at runtime

`ThemeProvider` owns both axes and writes `data-theme` / `data-mode` — to `document.documentElement` by default, or to a wrapper `<div>` with `target="scope"` (which is how two combinations render side by side in one story). `Theme` is deliberately an **open string** (`'confetti' | 'adventure' | 'neon' | (string & {})`) so a downstream project can pass its own theme name backed by its own `[data-theme]` block without editing this repo. `DEFAULT_THEME` / `DEFAULT_MODE` are the heads of `THEMES` / `MODES` — reorder the array to move a default rather than editing literals elsewhere.

## Contrast

Documented contrast ratios are computed, not typed: `src/foundations/contrast.ts` implements WCAG 2.1 math (including flattening translucent colors onto their backdrop) and the Foundations pages read the built `tokens.json`. When a brand color fails AA in a given mode, the fix is an override entry in `tokens/overrides/<theme>.<mode>.json` with a comment recording the measured ratio — see `adventure.dark.json` for the shape.

## Docs and README

`README.md` is a front door only — a short pitch plus links to the Chromatic docs and `docs/ARCHITECTURE.md`. Don't grow it; substantive documentation belongs in `docs/` or in Storybook MDX under `src/foundations/`.
