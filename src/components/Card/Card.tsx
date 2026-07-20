import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export type CardSurface = 'card' | 'raised';

/* Hover angles, as multipliers of --card-tilt-max. Deliberately uneven and mixed-sign
   so neighbouring cards in a grid don't lift the same way. No zero — a card that lifts
   without turning reads as a missed frame rather than a choice. */
const TILT_STEPS = [-1, 0.62, -0.45, 0.85, -0.78, 0.5, -0.32, 0.7];

/* The angle must be stable per card, not random: Chromatic re-snapshots every build,
   and Math.random() would flag every card as changed every time. Hashing the seed also
   beats :nth-child, which would re-assign angles whenever a filter reorders the grid.

   FNV-1a with an avalanche step. A plain `h * 31 + c` hash bunches short, similar
   titles into the same buckets — six work titles landed on three distinct angles. */
function hash(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  return h >>> 0;
}

/** The angle this card turns to on hover, as a multiplier of `--card-tilt-max`. */
function tiltStep(seed: string): number {
  return TILT_STEPS[hash(seed) % TILT_STEPS.length];
}

// `title` is widened from the DOM's string-only attribute to a ReactNode slot.
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional mono eyebrow above the title. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Adds the hover lift + hard shadow. Use for cards that link somewhere. */
  interactive?: boolean;
  /** `raised` uses the paper-raised surface instead of the card interior. */
  surface?: CardSurface;
  /**
   * String the hover angle is derived from. Defaults to `title` when it's a string. The
   * same seed always yields the same angle, so a card turns the same way across filters
   * and re-sorts.
   */
  seed?: string;
  /**
   * Escape hatch: the hover angle as a multiplier of `--card-tilt-max` in -1..1,
   * bypassing the seed. `0` keeps the card square through the lift.
   */
  tilt?: number;
  children?: ReactNode;
}

export function Card({
  eyebrow,
  title,
  interactive = false,
  surface = 'card',
  seed,
  tilt,
  children,
  className,
  style,
  ...rest
}: CardProps) {
  const seedText = seed ?? (typeof title === 'string' ? title : undefined);
  // Cards sit square at rest and only turn on hover. With no seed and no explicit tilt
  // there is nothing stable to derive from, so the card lifts without turning rather
  // than picking an angle that would shift whenever the title changed.
  const hoverStep = tilt ?? (seedText ? tiltStep(seedText) : 0);

  const tiltStyle = {
    '--card-tilt-hover': `calc(var(--card-tilt-max) * ${hoverStep})`,
    ...style,
  } as CSSProperties;

  return (
    <div
      className={[
        'cf-card',
        surface === 'raised' && 'cf-card--raised',
        interactive && 'cf-card--interactive',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={tiltStyle}
      {...rest}
    >
      {eyebrow ? <span className="cf-card__eyebrow">{eyebrow}</span> : null}
      {title ? <h3 className="cf-card__title">{title}</h3> : null}
      {children ? <div className="cf-card__body">{children}</div> : null}
    </div>
  );
}
