import type { CSSProperties, ReactNode } from 'react';
import { useTokenGroup, useTokenList, useThemeAttrs, type TokenRecord } from './tokens';

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

function Caption({ name, value, comment }: { name: string; value: string; comment?: ReactNode }) {
  return (
    <div style={{ ...mono, lineHeight: 1.5 }}>
      <div style={{ fontWeight: 700 }}>--{name}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>{value}</div>
      {comment ? (
        <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{comment}</div>
      ) : null}
    </div>
  );
}

/** Color swatches for every token matching `prefix`, live from the build. */
export function ColorGrid({ prefix }: { prefix: string }) {
  const tokens = useTokenGroup(prefix);
  const themed = useThemeAttrs();

  return (
    <div {...themed} style={grid('200px')}>
      {tokens.map(([name, token]) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inline)' }}>
          <div
            style={{
              background: `var(--${name})`,
              border: 'var(--border-width-default) solid var(--color-border-default)',
              borderRadius: 'var(--radius-container)',
              height: 64,
            }}
          />
          <Caption name={name} value={token.value} comment={token.comment} />
        </div>
      ))}
    </div>
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

export type { TokenRecord };
