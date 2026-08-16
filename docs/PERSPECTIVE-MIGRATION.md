# Perspective naming migration

Confetti's token names are being brought onto the structure and naming convention used by the
[Perspective Design System](https://www.figma.com/design/nordHMziieQgLbg3UKUudF/Perspective-Design-System)
so the two systems read the same way.

This is a **rename and regroup only**. No token value changes at any point — the migration is
verified by diffing the built `tokens.css` and asserting that every variable which keeps its
name also keeps its exact value.

## What Perspective settles

| | Perspective | Confetti before |
| --- | --- | --- |
| Numeric scales | ordinal steps — `100`, `200`, `300`… | literal values (`font.size.16`) or t-shirt (`radius.md`) |
| Colour group | `colors` | `color` |
| Widths / heights / strokes | one `size` ramp | split across `space.*`, `font.size.*`, `border.width.*` |
| Tiers | `_primitives` → `theme` → `components` | primitives → semantic → component |

Perspective's step names are **positions on a ramp, not the value sitting at that position** —
which is the whole point: retuning a step never makes its name a lie. `font.size.16` had exactly
that problem, and is now `font-size.300`.

### Where the two systems genuinely differ

Perspective has **one** variable axis (Light / Dark). Confetti has **two** — theme
(`confetti` / `adventure` / `neon`) × mode — composed by the cascade and deliberately never a
matrix. Perspective's `theme` collection maps onto Confetti's **mode** axis; its structure has
no place for the brand axis, so `tokens/themes/` and `tokens/overrides/` stay as a Confetti
extension. The brand-kit contract is unchanged.

Confetti also carries groups Perspective has no equivalent for — `shadow`, `motion`, `effect`,
`z`, `syntax`, `focus` — which keep their current shape.

---

## Stage 1 — primitives (done)

| Rule | Example |
| --- | --- |
| `color.*` → `colors.*` | `--color-ink-600` → `--colors-ink-600` |
| font-size literals → ordinal | `--font-size-16` → `--font-size-300` |
| radius t-shirt → ordinal | `--radius-md` → `--radius-300` |
| stroke widths → the `size` ramp | `--border-width-hairline` → `--size-100` |
| space indices → ordinal | `--space-4` → `--space-400` |

Full step mappings:

```
font-size   12→100  14→200  16→300  18→400  20→500
            22→600  24→700  32→800  40→900  48→1000    (hero keeps its name)

radius      xs→100  sm→200  md→300  lg→400              (none/full/circle keep names)

size (new)  100=1px 200=2px 300=4px 400=8px  500=12px 600=14px
            700=16px 800=20px 900=24px 1000=32px 1100=40px 1200=48px

space       1→100  2→200  3→300  4→400   5→500   6→600
            8→700  10→800 12→900 16→1000 20→1100          (0 keeps its name)
```

**Deliberate exceptions**

- `space.0`, `radius.none`, `radius.full`, `radius.circle` keep names. Zero and absolutes are
  not steps on a ramp.
- `font-size.hero` keeps its name — it is a fluid `clamp()`, not a step.
- **Icon sizes still alias the type ramp**, not the new `size` ramp. They are `rem`-based on
  purpose so a glyph beside a label grows with the reader's font-size preference. Moving them
  onto the pixel ramp silently converted `1rem` → `16px`; that was caught by the value diff and
  reverted.

### Later stages — also done

- **Stage 1b — extension primitives**: `motion.duration.*` → `duration.100…300`,
  `motion.easing.*` → `easing.*`, `z.base…overlay` → `z.100…400`.
- **Stage 2 — semantic tier**: roles lifted out from under `color.*` into `action` / `status` /
  `text` / `surface` / `borders` / `elevation`.
- **Stage 3 — component tier**: `bg` → `fill`, `fg` → `text`, `border-color` → `border`,
  `padding-x`/`-y` → `padding-horizontal`/`-vertical`.

**Across all stages: 259 variables renamed, 0 literal values changed** (476 → 476, identical
multiset). The naming rules themselves live in [TOKEN-CONVENTION.md](./TOKEN-CONVENTION.md),
which is canonical and shared with Zeus and Perspective.

> The portfolio figures in the section below cover **stage 1 only** and are kept for the record.
> Across the whole migration the portfolio touches 65 renamed variables in 12 hand-authored
> files; everything under `src/lib/confetti/**`, plus `tokens.css` and `tailwind.theme.js`, is
> overwritten by `sync-tokens.mjs` and repairs itself.

---

## Portfolio impact — Stage 1

**136 variables across 6 files.**

`src/styles/tailwind.theme.js` and `src/styles/tokens.css` are **overwritten by
`npm run sync:tokens`** (see `scripts/sync-tokens.mjs`), so they repair themselves on the next
`predev`. That leaves five hand-authored files:

- `src/styles/site.css`
- `src/components/Footer.astro`
- `src/components/Navbar.astro`
- `src/pages/about.astro`
- `src/pages/index.astro`

The sync script copies **source files only** and never touches these, so nothing repairs them
automatically — the portfolio will render with unresolved `var()` references until they are
updated.

### Applying it

Run from the portfolio root, after syncing tokens:

```bash
python3 - <<'PY'
import os, re
HUES = ('amber|bark|base|berry|chalk|clay|cream|forest|glow|grape|graphite|green|haze|ink|'
        'moss|neon|orange|pine|pink|purple|red|sage|sand|synth|teal|yellow')
SPACE = {'1':'100','2':'200','3':'300','4':'400','5':'500','6':'600',
         '8':'700','10':'800','12':'900','16':'1000','20':'1100'}
FS  = {'12':'100','14':'200','16':'300','18':'400','20':'500',
       '22':'600','24':'700','32':'800','40':'900','48':'1000'}
RAD = {'xs':'100','sm':'200','md':'300','lg':'400'}
BW  = {'hairline':'100','sticker':'200','heavy':'300'}

def convert(s):
    s = re.sub(rf'--color-({HUES})-', r'--colors-\1-', s)
    s = re.sub(r'--border-width-(hairline|sticker|heavy)(?![a-z-])',
               lambda m: '--size-' + BW[m.group(1)], s)
    s = re.sub(r'--radius-(xs|sm|md|lg)(?![a-z0-9-])',
               lambda m: '--radius-' + RAD[m.group(1)], s)
    s = re.sub(r'--space-(\d+)(?![\d-])',
               lambda m: '--space-' + SPACE.get(m.group(1), m.group(1)), s)
    s = re.sub(r'--font-size-(\d+)(?![\d-])',
               lambda m: '--font-size-' + FS.get(m.group(1), m.group(1)), s)
    return s

for dp, _, files in os.walk('src'):
    for f in files:
        if not f.endswith(('.css', '.tsx', '.ts', '.astro', '.js')):
            continue
        p = os.path.join(dp, f)
        t = open(p).read()
        n = convert(t)
        if n != t:
            open(p, 'w').write(n)
            print('updated', p)
PY
```

The rules are the same ones applied inside Confetti, so the two stay consistent.

### Checking afterwards

Nothing here changes a value, so the portfolio should look **pixel-identical**. Any visible
change means a `var()` failed to resolve and fell back. To find leftovers:

```bash
grep -rnE "var\(--(color-(cream|ink|graphite|chalk|pine|sand|bark|forest|sage|moss|clay|amber|berry|neon|haze|grape|synth|glow|base|yellow)-|border-width-(hairline|sticker|heavy)|radius-(xs|sm|md|lg)\)|space-(1|2|3|4|5|6|8|10|12|16|20)\))" src/
```
