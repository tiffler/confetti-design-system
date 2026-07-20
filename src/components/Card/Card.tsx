import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export type CardSurface = 'card' | 'raised';

/* Multipliers of --card-tilt-max. Deliberately uneven and mixed-sign so a grid reads
   as hand-placed rather than alternating. No zero — a flat card among tilted ones
   looks like a bug. */
const TILT_STEPS = [-1, 0.62, -0.45, 0.85, -0.78, 0.5, -0.32, 0.7];

/* Magnitudes for the hover angle, which always swings to the opposite side of flat. */
const HOVER_MAGNITUDES = [0.5, 0.72, 0.95, 0.6, 0.85, 1.0];

/* Tilt must be stable per card, not random: Chromatic re-snapshots every build, and
   Math.random() would flag every card as changed every time. Hashing the seed also
   beats :nth-child, which would re-tilt cards whenever a filter reorders the grid.

   FNV-1a with an avalanche step. A plain `h * 31 + c` hash bunches short, similar
   titles into the same buckets — six work titles landed on three distinct angles. */
function hash(seed: string, salt = 0): number {
  let h = (2166136261 ^ salt) >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  return h >>> 0;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Rest and hover angles for one card, as multipliers of `--card-tilt-max`.
 *
 * Hover always crosses to the other side of flat rather than leaning further the same
 * way: leaning further reads as drift, while crossing over reads as the sticker being
 * picked up and set back down. It also keeps the swing bounded without clamping, which
 * was flattening distinct cards onto the same hover angle.
 */
function tiltSteps(seed: string): { rest: number; hover: number } {
  const rest = TILT_STEPS[hash(seed) % TILT_STEPS.length];
  const magnitude = HOVER_MAGNITUDES[hash(seed, 0x9e3779b9) % HOVER_MAGNITUDES.length];
  return { rest, hover: round2(rest > 0 ? -magnitude : magnitude) };
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
   * String the tilt is derived from. Defaults to `title` when it's a string. Same seed
   * always yields the same angle, so a card keeps its tilt across filters and re-sorts.
   */
  seed?: string;
  /**
   * Escape hatch: a multiplier of `--card-tilt-max` in -1..1, bypassing the seed.
   * `0` sits the card flat.
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
  // No seed and no explicit tilt means nothing stable to derive from — sit flat
  // rather than invent an angle that shifts when the title changes.
  const steps = seedText ? tiltSteps(seedText) : { rest: 0, hover: 0 };
  const restStep = tilt ?? steps.rest;
  // An explicit `tilt` pins the rest angle; the hover swing still comes off the seed, so
  // a hand-placed card keeps the same liveliness as its neighbours. A card pinned flat
  // (tilt={0}) stays flat on hover too — it was placed that way deliberately.
  const hoverStep =
    tilt === undefined ? steps.hover : tilt === 0 ? 0 : round2(tilt > 0 ? -Math.abs(steps.hover) : Math.abs(steps.hover));

  const tiltStyle = {
    '--card-tilt': `calc(var(--card-tilt-max) * ${restStep})`,
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
