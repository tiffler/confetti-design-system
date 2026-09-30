# Token convention

The single naming and structure convention for every design system in this account.

**Canonical source.** This file. Perspective's Figma variables are the *origin* of the
convention, but where Figma and this document disagree, this document wins — it is the one
place that can be versioned, diffed and referenced from a PR.

**Scope.** Perspective, Zeus, Confetti. Hamstack is deliberately out of scope: it is a
single-tier, hand-authored system with its own `--ham-` prefix, and forcing it into a three-tier
pipeline would be a rebuild rather than a rename.

---

## 1. Three tiers, one rule about references

| Tier | Holds | May reference |
| --- | --- | --- |
| **primitive** | raw values — the palette | primitives only |
| **semantic** | roles: what a value is *for* | primitives, semantics |
| **component** | per-component decisions | semantics only |

A component token referencing a primitive is **layer skipping** and must fail the build. A
semantic or component token holding a literal is a violation too. Confetti enforces this in
`style-dictionary/audit-layers.js`; every system should have the equivalent.

---

## 2. Primitives

### Ordinal steps, always

Every numeric scale uses ordinal step names — `100`, `200`, `300` … — never the value and never
a t-shirt size.

```
✅ font-size.300        ❌ font-size.16      (renaming the value makes the name a lie)
✅ radius.300           ❌ radius.md         (t-shirt sizes belong to the semantic tier)
✅ space.400            ❌ space.4
```

A step name is a **position on a ramp**, not the value sitting at that position. That is the
entire argument: retuning a step must never require renaming it.

### The groups

| Group | Contains |
| --- | --- |
| `colors` | hue families, each with ordinal steps — `colors.ink.600` |
| `font-size` | the type ramp |
| `space` | the spacing ramp |
| `size` | one ramp for **every** width, height and stroke |
| `radius` | corner radii |
| `opacity` | alpha values |

Note `colors` is **plural** and `space` is **singular**. Both are arbitrary; both are settled.

`size` is one ramp shared by control heights, icon boxes and border widths. Widths and heights
must not borrow the `space` or `font-size` ramps — that coupling is how a spacing change ends up
resizing a control.

### Named exceptions

Values that are not steps on a ramp keep names: `space.0`, `radius.none`, `radius.full`,
`radius.circle`, `font-size.hero` (a fluid `clamp()`), `colors.base.white` / `.black` /
`.transparent`.

Zero and absolutes are not positions on a ramp.

### Extensions

Groups no system can express with the six above. Names are fixed here so two systems do not
invent different ones for the same idea:

| Group | Shape | Note |
| --- | --- | --- |
| `shadow` | ordinal — `shadow.100` | not `shadow.lift` — that is a role, so it is semantic |
| `z` | ordinal — `z.100` | semantic gives it meaning: `z.modal` |
| `duration` | ordinal — `duration.100` | |
| `easing` | named — `easing.standard` | curves are not a ramp |
| `font-family` | named | |
| `font-weight` | named — `regular`, `semibold`, `bold` | |
| `line-height` | ordinal | |
| `letter-spacing` | ordinal | |
| `breakpoint` | ordinal | |

---

## 3. Semantic tier

Roles say what a value is **for**. This is the tier application code should reach for.

| Group | Covers |
| --- | --- |
| `action` | interactive fills and their states — `default`, `prominent`, `subtle`, `disabled` |
| `status` | `danger`, `success`, `urgent`, `active`, `info`, plus `multi-tone` tints |
| `text` | `default`, `subtle`, `muted`, `inverse`, `on-solid` |
| `surface` | `page`, `card`, `overlay`, `section` — each with `default` / `subtle` / `inverse` |
| `borders` | `stroke-color`, `stroke-weight`, `radius` |
| `elevation` | shadow roles |
| `font` | families, and the `size` role ramp (`h1`, `body`, `label`) |
| `control` | `height`, shared control geometry |
| `icon` | icon box sizes |
| `motion` | `duration`, `easing` roles |
| `layout` | page-level spacing roles |
| `z` | stacking roles — `modal`, `toast`, `tooltip` |

### Nesting, not hyphenation

```
✅ borders.radius.md          ❌ borders.radius-md
✅ surface.page.default       ❌ surface-page-default
```

Hyphens join words *within* one segment (`stroke-weight`, `on-solid`), never levels.

### T-shirt sizes are lowercase

`xxs xs sm md lg xl xxl` — everywhere, for every group.

> Perspective's Figma file is inconsistent here: `borders/radius` uses `XS/S/M/L` while
> `surface/spacing` uses `xxs…xxl`. Lowercase wins. Fix the Figma file to match.

T-shirt names live **only** at the semantic tier. Primitives are ordinal; semantics are
human-scaled. That split is what lets `radius.md` be repointed from `radius.300` to `radius.400`
without either name lying.

---

## 4. Component tier

One group per component, named for the component. Within it, name the **part and property**:

```
button.solid.fill            button.padding-horizontal
button.outline.border        button.content-gap
button.ghost.text            button.height
```

Use `fill` / `text` / `border` for colour roles — not `bg` / `fg`. Use
`padding-horizontal` / `padding-vertical`, not `padding-x` / `padding-y`.

Component tokens reference semantics only, never primitives.

---

## 5. Conformance

| | Perspective | Zeus | Confetti |
| --- | --- | --- | --- |
| Three tiers | ✅ | ✅ | ✅ |
| Ordinal numeric primitives | ✅ | ✅ | ✅ |
| `colors` (plural) | ✅ | ❌ `color` | ✅ |
| `space` (singular) | ✅ | ❌ `spacing` | ✅ |
| Semantic group vocabulary | ✅ | ⚠️ mostly | ✅ |
| Nested, not hyphenated | ✅ | ❌ `borders.radius-control` | ✅ |
| Lowercase t-shirt | ❌ mixed case | ✅ | ✅ |
| Component `fill`/`text`/`border` | ✅ | ⚠️ | ✅ |

### Outstanding work

**Perspective (Figma)** — rename `borders/radius` `XS/S/M/L` → `xs/sm/md/lg`.

**Zeus** — rename `color` → `colors`, `spacing` → `space`; flatten
`borders.radius-control` → `borders.radius.control`. Note Zeus's components read **semantic**
tokens directly (958 references, no component-token layer in use), so these renames land on
268 component references — budget accordingly.

**Confetti** — done. 259 variables renamed across all three tiers; literal values verified
unchanged (476 → 476, identical multiset).

### Confetti's documented deviations

- `shadow.soft` / `lifted` / `soft-deep` / `lifted-deep` and `motion.lift-soft` / `tilt.none` stay named, for the
  same reason as `hard-ink` below: `-deep` is the dark-surface counterpart of a shadow, not a larger step.
- `shadow.none` / `hard-ink` / `hard-cream` stay named. They are two mode counterparts of one
  hard-offset shadow, not a magnitude ramp — ordinal steps would imply an ordering that does
  not exist. The *roles* built on them are `elevation.*`, which is the part that matters.
- `motion.lift` / `rest` / `tilt` and `effect.brightness.*` stay named for the same reason.
- Brand-kit inputs live under `brand.*` (including `brand.accent.*`). Keeping them in a
  separate namespace from the `accent.*` **roles** is not cosmetic: when both were called
  `accent.purple`, the role became a circular reference to its own input and the build failed.

Each is a rename, not a redesign. None changes a single value — and that is the check: after any
migration, diff the built output and assert that every variable which kept its name kept its
value.

---

## 6. Adding a system

Point its README at this file. Do not restate the convention locally — a second copy is how the
drift started.
