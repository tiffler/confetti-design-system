import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './pages.css';

/**
 * Layout and type primitives shared by the example pages under `Pages/`.
 *
 * This is demo scaffolding, not part of the system's public surface — deliberately not
 * exported from `src/index.ts`. It exists so the pages read as pages rather than as walls
 * of inline style, and it composes the same semantic tokens a consuming app would: nothing
 * here reaches for a primitive or a raw value, so every page re-skins with the toolbar.
 *
 * The one exception is layout arithmetic — container widths and grid track minimums are
 * decisions belonging to a specific page, not to the system, so there is no token for them.
 */

type DivProps = HTMLAttributes<HTMLDivElement>;

/** Centres a page at a comfortable measure and spaces its major sections. */
export function Page({
  width = 1060,
  gap = 'var(--space-layout)',
  style,
  children,
  ...rest
}: DivProps & { width?: number; gap?: string }) {
  return (
    <div
      style={{
        maxWidth: width,
        margin: '0 auto',
        paddingBlock: 'var(--space-layout-sm)',
        display: 'grid',
        gap,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Vertical rhythm. `gap` takes a spacing token. */
export function Stack({ gap = 'var(--space-stack)', style, children, ...rest }: DivProps & { gap?: string }) {
  return (
    <div style={{ display: 'grid', gap, ...style }} {...rest}>
      {children}
    </div>
  );
}

/** Horizontal rhythm. Wraps by default — every page here has to survive a narrow canvas. */
export function Row({
  gap = 'var(--space-inline)',
  align = 'center',
  justify,
  wrap = true,
  style,
  children,
  ...rest
}: DivProps & {
  gap?: string;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Auto-fitting grid. `min` is the narrowest a track may get before the count drops;
 * `min(100%, …)` keeps a single column from overflowing a canvas narrower than that.
 */
export function Grid({
  min = 240,
  gap = 'var(--space-stack)',
  style,
  children,
  ...rest
}: DivProps & { min?: number; gap?: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gap,
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Mono uppercase kicker — the same treatment as a Card's eyebrow. */
export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-family-label)',
        fontSize: 'var(--font-size-label)',
        fontWeight: 'var(--font-weight-label)',
        letterSpacing: 'var(--font-tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Display-face heading. `leading` is a separate knob because the scale pairs its two ends
 * with different values: heading leading (1.3) is right down at h3/h4, but at the display
 * size — which clamps up to ~104px — it opens a gap you could park a card in. A hero passes
 * `--font-leading-display` (1) and sets solid.
 */
export function Title({
  as: Tag = 'h1',
  size = 'var(--font-size-h1)',
  leading = 'var(--font-leading-heading)',
  children,
  style,
}: {
  as?: 'h1' | 'h2' | 'h3';
  size?: string;
  leading?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Tag
      style={{
        margin: 0,
        fontFamily: 'var(--font-family-display)',
        fontSize: size,
        fontWeight: 'var(--font-weight-display)',
        lineHeight: leading,
        letterSpacing: 'var(--font-tracking-display)',
        color: 'var(--color-text-primary)',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/** Standfirst paragraph — one step up from body, muted. */
export function Lede({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      style={{
        margin: 0,
        maxWidth: '60ch',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--font-size-h5)',
        lineHeight: 'var(--font-leading-body)',
        color: 'var(--color-text-muted)',
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/** Body copy. */
export function Text({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--font-size-body)',
        lineHeight: 'var(--font-leading-body)',
        color: 'var(--color-text-primary)',
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/** Small mono detail — timestamps, counts, author lines. Sentence case, unlike Eyebrow. */
export function Caption({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-family-label)',
        fontSize: 'var(--font-size-label)',
        letterSpacing: 'var(--font-tracking-normal)',
        color: 'var(--color-text-muted)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** The big number on a stat tile. Display face, tight leading so it sits on its label. */
export function Figure({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--font-size-h2)',
        fontWeight: 'var(--font-weight-display)',
        lineHeight: 'var(--font-leading-none)',
        color: 'var(--color-text-primary)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Dashed annotation frame — the spec-sheet convention, one group per component family.
 *
 * The dashes are chrome for the sheet, not part of any component, so they take the purple
 * accent rather than a border role: it reads as annotation whatever the theme. The four
 * accents are part of the brand-kit contract, so any theme added later defines this hue too.
 */
export function Frame({
  label,
  children,
  style,
  ...rest
}: Omit<HTMLAttributes<HTMLElement>, 'title'> & { label?: ReactNode }) {
  return (
    <section
      style={{
        border: 'var(--border-width-hairline) dashed var(--color-accent-purple-bold)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-inset)',
        display: 'grid',
        gap: 'var(--space-stack)',
        alignContent: 'start',
        ...style,
      }}
      {...rest}
    >
      {label ? <Eyebrow>{label}</Eyebrow> : null}
      {children}
    </section>
  );
}

/**
 * Masonry column flow for a sheet of frames of wildly different heights. Multi-column
 * rather than grid because the frames should pack by height, not sit in ragged rows —
 * each `Frame` inside needs `break-inside: avoid` (see `.pg-sheet > *` in pages.css).
 */
export function Sheet({
  columnWidth = 320,
  style,
  children,
  ...rest
}: DivProps & { columnWidth?: number }) {
  return (
    <div
      className="pg-sheet"
      style={{ columnWidth, columnGap: 'var(--space-stack)', ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Column header inside a specimen matrix — smaller and quieter than an Eyebrow. */
export function Tick({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-family-label)',
        fontSize: 'var(--font-size-label)',
        letterSpacing: 'var(--font-tracking-normal)',
        color: 'var(--color-text-muted)',
        alignSelf: 'center',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Hairline separator on the subtle border role. */
export function Rule({ style }: { style?: CSSProperties }) {
  return (
    <hr
      style={{
        border: 0,
        borderTop: 'var(--border-width-hairline) solid var(--color-border-subtle)',
        margin: 0,
        ...style,
      }}
    />
  );
}
