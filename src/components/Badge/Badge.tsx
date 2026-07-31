import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

/**
 * The four decorative hues, plus two that are not categories: `neutral` (a label, a count,
 * a version) and `success` (a state). Both carry their own foregrounds — see Badge.css.
 */
export type BadgeHue = 'purple' | 'teal' | 'orange' | 'pink' | 'success' | 'neutral';
export type BadgeTone = 'bold' | 'subtle';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  hue?: BadgeHue;
  /** `bold` is the saturated end of the hue pair, `subtle` the tint end. */
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({
  hue = 'purple',
  tone = 'bold',
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={['cf-badge', `cf-badge--${tone}`, `cf-badge--${hue}`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}
