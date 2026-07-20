import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import { useTokenGroup, useTokenList, useTokens, useThemeAttrs, type TokenRecord } from './tokens';
import { contrastRatio, gradeText, luminanceOf, toHex, toRgbString } from './contrast';

const mono: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--font-size-label)',
};

const grid = (min: string): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))`,
  gap: 'var(--space-stack)',
  margin: 'var(--space-inset) 0',
});

/**
 * Click-to-copy value.
 *
 * The async clipboard API needs transient user activation, so it rejects for scripted
 * clicks and in some embedded contexts; `execCommand` is the fallback. If both fail the
 * label says so rather than claiming success — a copy button that lies is worse than
 * one that doesn't work, because you only find out after pasting the wrong thing.
 */
function CopyValue({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = useCallback(async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(el);
    }
    setState(ok ? 'copied' : 'failed');
    window.setTimeout(() => setState('idle'), 1400);
  }, [text]);

  const copied = state === 'copied';

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${text}`}
      aria-label={`Copy ${text}`}
      style={{
        ...mono,
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 0,
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        color: 'var(--color-text-muted)',
        font: 'inherit',
      }}
    >
      {copied ? 'copied' : state === 'failed' ? 'copy blocked — select manually' : text}
    </button>
  );
}

function Caption({ name, value, comment }: { name: string; value: string; comment?: ReactNode }) {
  // Every swatch shows both notations regardless of how the token was authored, so the
  // captions stay uniform across the page.
  const hex = toHex(value);
  const rgb = toRgbString(value);

  return (
    <div style={{ ...mono, lineHeight: 1.5 }}>
      <div style={{ fontWeight: 700 }}>--{name}</div>
      {hex ? <CopyValue text={hex} /> : null}
      {rgb ? <CopyValue text={rgb} /> : null}
      {!hex && !rgb ? <div style={{ color: 'var(--color-text-muted)' }}>{value}</div> : null}
      {comment ? (
        <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{comment}</div>
      ) : null}
    </div>
  );
}

/** WCAG AA threshold for body text. Nothing below this appears on the page at all. */
const AA = 4.5;

/**
 * Specimen surface. Token text colors are only meaningful against token surfaces — the
 * Storybook docs canvas is its own background, and rendering `text-muted` straight onto
 * it measured 3.18:1 in dark mode. Every specimen sits on `surface-page` so the colors
 * it demonstrates are the colors it is judged against.
 */
function Surface({ children }: { children: ReactNode }) {
  const themed = useThemeAttrs();
  return (
    <div
      {...themed}
      style={{
        background: 'var(--color-surface-page)',
        color: 'var(--color-text-primary)',
        border: 'var(--border-width-default) solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-container)',
        padding: 'var(--space-inset)',
        margin: 'var(--space-inset) 0',
      }}
    >
      {children}
    </div>
  );
}

/** Ratios are only ever rendered for combinations that pass, so there is no fail state. */
function Ratio({ ratio }: { ratio: number }) {
  return (
    <span
      style={{ ...mono, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)' }}
      title={`${ratio.toFixed(2)}:1 — ${gradeText(ratio)} for body text`}
    >
      {ratio.toFixed(1)}:1 <span style={{ opacity: 0.75 }}>{gradeText(ratio)}</span>
    </span>
  );
}

/**
 * Color swatches for every token matching `prefix`, live from the build.
 *
 * Sorted lightest to darkest by relative luminance rather than source order, so a
 * ramp reads as a ramp. Each swatch carries live text in both ink and cream with
 * the measured ratio, which is the only way to see at a glance which foreground a
 * surface can actually carry.
 */
export function ColorGrid({ prefix, sort = 'luminance' }: { prefix: string; sort?: 'luminance' | 'source' }) {
  const tokens = useTokenGroup(prefix);
  const all = useTokens();

  // Translucent tokens are flattened onto the page surface before ranking, so they
  // sort by what renders rather than by their raw alpha value.
  const page = all['color-surface-page']?.value ?? '#ffffff';
  const ink = all['color-text-primary']?.value;
  const cream = all['color-text-inverse']?.value;

  const ordered =
    sort === 'source'
      ? tokens
      : [...tokens].sort(
          (a, b) => (luminanceOf(b[1].value, page) ?? -1) - (luminanceOf(a[1].value, page) ?? -1)
        );

  return (
    <Surface>
    <div style={grid('232px')}>
      {ordered.map(([name, token]) => {
        // `page` is the backdrop: translucent swatches render over the page surface,
        // so that is what their alpha composites against.
        const inkRatio = ink ? contrastRatio(ink, token.value, page) : null;
        const creamRatio = cream ? contrastRatio(cream, token.value, page) : null;
        const inkOk = !!inkRatio && inkRatio >= AA;
        const creamOk = !!creamRatio && creamRatio >= AA;

        return (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inline)' }}>
            {/* Only foregrounds that clear AA are shown, and only their ratios are
                reported. Nothing that fails appears on the page in any form. */}
            <div
              style={{
                background: `var(--${name})`,
                border: 'var(--border-width-default) solid var(--color-border-default)',
                borderRadius: 'var(--radius-container)',
                padding: 'var(--space-inline)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 2,
                minHeight: 64,
              }}
            >
              {inkOk ? (
                <span style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-body)' }}>
                  Aa — ink
                </span>
              ) : null}
              {creamOk ? (
                <span style={{ color: 'var(--color-text-inverse)', fontSize: 'var(--font-size-body)' }}>
                  Aa — cream
                </span>
              ) : null}
            </div>

            <Caption name={name} value={token.value} comment={token.comment} />

            {inkOk || creamOk ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {inkOk ? (
                  <span style={mono}>
                    <span style={{ color: 'var(--color-text-muted)' }}>ink </span>
                    <Ratio ratio={inkRatio as number} />
                  </span>
                ) : null}
                {creamOk ? (
                  <span style={mono}>
                    <span style={{ color: 'var(--color-text-muted)' }}>cream </span>
                    <Ratio ratio={creamRatio as number} />
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
    </Surface>
  );
}

/**
 * Explicit foreground/background pairs with their measured ratio — the pairs the
 * components actually produce, which a swatch grid can't show on its own.
 *
 * Pairs below AA are dropped from the list entirely rather than shown as a failure.
 * The list documents what the system can do; the contrast audit is where failures
 * belong.
 */
export function ContrastPairs({
  pairs,
}: {
  pairs: Array<{ fg: string; bg: string; label: string; sample?: string }>;
}) {
  const all = useTokens();

  const page = all['color-surface-page']?.value ?? '#ffffff';

  const passing = pairs
    .map((p) => {
      const fgv = all[p.fg]?.value;
      const bgv = all[p.bg]?.value;
      return { ...p, ratio: fgv && bgv ? contrastRatio(fgv, bgv, page) : null };
    })
    .filter((p): p is typeof p & { ratio: number } => p.ratio !== null && p.ratio >= AA);

  if (passing.length === 0) return null;

  return (
    <Surface>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inline)' }}>
      {passing.map((p) => {
        const ratio = p.ratio;

        return (
          // Metadata sits outside the tinted box on purpose — inside, it inherits the
          // pair's background and becomes unreadable on the saturated ones.
          <div
            key={p.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-inset)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: '1 1 320px',
                background: `var(--${p.bg})`,
                border: 'var(--border-width-default) solid var(--color-border-default)',
                borderRadius: 'var(--radius-container)',
                padding: 'var(--space-inline) var(--space-inset)',
              }}
            >
              <span style={{ color: `var(--${p.fg})`, fontSize: 'var(--font-size-body)' }}>
                {p.sample ?? 'The quick brown fox jumps over the lazy dog'}
              </span>
            </div>
            <span
              style={{
                display: 'flex',
                gap: 'var(--space-inline)',
                alignItems: 'center',
                flex: '0 0 auto',
                minWidth: 240,
              }}
            >
              <span style={{ ...mono, color: 'var(--color-text-muted)' }}>{p.label}</span>
              <Ratio ratio={ratio} />
            </span>
          </div>
        );
      })}
    </div>
    </Surface>
  );
}

/** Renders each type token as a live specimen using its own value. */
export function TypeSpecimens({
  roles,
}: {
  roles: Array<{ label: string; family: string; size: string; weight: string; tracking?: string; leading?: string; uppercase?: boolean }>;
}) {
  const themed = useThemeAttrs();

  return (
    <div {...themed} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inset)', margin: 'var(--space-inset) 0' }}>
      {roles.map((role) => (
        <div key={role.label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inline)' }}>
          <div style={{ ...mono, color: 'var(--color-text-muted)' }}>{role.label}</div>
          <div
            style={{
              fontFamily: `var(--${role.family})`,
              fontSize: `var(--${role.size})`,
              fontWeight: `var(--${role.weight})` as CSSProperties['fontWeight'],
              letterSpacing: role.tracking ? `var(--${role.tracking})` : undefined,
              lineHeight: role.leading ? `var(--${role.leading})` : undefined,
              textTransform: role.uppercase ? 'uppercase' : undefined,
              containerType: 'inline-size',
            }}
          >
            Confetti
          </div>
        </div>
      ))}
    </div>
  );
}

/** Spacing scale drawn as bars at their actual size. */
export function SpacingScale({ names }: { names: string[] }) {
  const tokens = useTokenList(names);
  const themed = useThemeAttrs();

  return (
    <div {...themed} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inline)', margin: 'var(--space-inset) 0' }}>
      {tokens.map(([name, token]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-stack)' }}>
          <div
            style={{
              width: `var(--${name})`,
              height: 16,
              minWidth: 1,
              background: 'var(--color-accent-purple-bold)',
              border: 'var(--border-width-default) solid var(--color-border-default)',
            }}
          />
          <span style={{ ...mono }}>
            --{name} · {token.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Radii shown as rounded boxes — a bar chart misreads 999px and 50%. */
export function RadiusGrid({ prefix }: { prefix: string }) {
  const tokens = useTokenGroup(prefix);
  const themed = useThemeAttrs();

  return (
    <div {...themed} style={grid('180px')}>
      {tokens.map(([name, token]) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inline)' }}>
          <div
            style={{
              height: 72,
              width: 72,
              background: 'var(--color-accent-teal-bold)',
              border: 'var(--border-width-default) solid var(--color-border-default)',
              borderRadius: `var(--${name})`,
            }}
          />
          <Caption name={name} value={token.value} comment={token.comment} />
        </div>
      ))}
    </div>
  );
}

/** Surface elevation steps, stacked so the ramp is visible in one view. */
export function ElevationStack({
  steps,
}: {
  steps: Array<{ token: string; label: string }>;
}) {
  const themed = useThemeAttrs();

  return (
    <div {...themed} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-stack)', margin: 'var(--space-inset) 0' }}>
      {steps.map((step) => (
        <div
          key={step.token}
          style={{
            background: `var(--${step.token})`,
            border: 'var(--border-width-default) solid var(--color-border-default)',
            borderRadius: 'var(--radius-container)',
            padding: 'var(--space-inset)',
            ...mono,
          }}
        >
          <strong>--{step.token}</strong> — {step.label}
        </div>
      ))}
    </div>
  );
}

/** The hard-offset "sticker lift" shadow, shown at rest and lifted. */
export function ShadowSpecimen() {
  const themed = useThemeAttrs();
  const box: CSSProperties = {
    background: 'var(--color-surface-card)',
    border: 'var(--border-width-default) solid var(--color-border-default)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--space-inset)',
    ...mono,
  };

  return (
    <div {...themed} style={{ display: 'flex', gap: 'var(--space-inset)', margin: 'var(--space-inset) var(--space-inset) var(--space-inset) 0', flexWrap: 'wrap' }}>
      <div style={box}>rest</div>
      <div style={{ ...box, boxShadow: 'var(--shadow-lift)', transform: 'translate(-2px, -2px)' }}>
        --shadow-lift
      </div>
    </div>
  );
}

/**
 * The Card component's own elevation, at rest and lifted. Uses the real `--card-*`
 * tokens rather than re-deriving them, so this can't drift from the component.
 */
export function CardElevation() {
  const themed = useThemeAttrs();
  const base: CSSProperties = {
    background: 'var(--card-bg)',
    color: 'var(--card-fg)',
    border: 'var(--card-border-width) solid var(--card-border-color)',
    borderRadius: 'var(--card-radius)',
    padding: 'var(--card-padding)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--card-gap)',
    flex: '1 1 240px',
  };

  const title: CSSProperties = {
    fontFamily: 'var(--card-title-font-family)',
    fontSize: 'var(--card-title-font-size)',
    fontWeight: 'var(--card-title-font-weight)' as CSSProperties['fontWeight'],
    letterSpacing: 'var(--card-title-tracking)',
    lineHeight: 'var(--card-title-leading)',
  };

  const body: CSSProperties = {
    fontFamily: 'var(--card-body-font-family)',
    fontSize: 'var(--card-body-font-size)',
    lineHeight: 'var(--card-body-leading)',
    color: 'var(--card-fg-muted)',
  };

  return (
    <div
      {...themed}
      style={{ display: 'flex', gap: 'var(--space-inset)', flexWrap: 'wrap', alignItems: 'flex-start' }}
    >
      <div style={base}>
        <span style={title}>At rest</span>
        <span style={body}>Sits flat on its surface. The 2px ink border is the only edge.</span>
      </div>
      <div
        style={{
          ...base,
          boxShadow: 'var(--card-shadow-hover)',
          transform: 'translate(-2px, -2px)',
        }}
      >
        <span style={title}>Lifted</span>
        <span style={body}>
          On hover, an interactive card shifts up-left onto a 3px hard shadow extruded
          from its own border.
        </span>
      </div>
    </div>
  );
}

export type { TokenRecord };
