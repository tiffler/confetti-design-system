import type { ComponentType } from 'react';
import type { IconProps as PhosphorProps, IconWeight } from '@phosphor-icons/react';
import './Icon.css';

export type IconSize = 'sm' | 'md' | 'lg';
export type IconTone = 'inherit' | 'default' | 'muted' | 'accent';

/**
 * A Phosphor icon component — `import { ArrowRight } from '@phosphor-icons/react'`.
 * Passed as a value, not a name, so bundlers tree-shake to the icons actually used
 * rather than pulling in all ~9,000.
 */
export type PhosphorIcon = ComponentType<PhosphorProps>;

export interface IconProps {
  icon: PhosphorIcon;
  /** Mirrors the type scale: sm 16px, md 20px, lg 24px. */
  size?: IconSize;
  /** `inherit` takes the surrounding text colour, which is right inside buttons and links. */
  tone?: IconTone;
  /**
   * Overrides the system weight. Reach for this rarely — a mixed-weight icon set is the
   * fastest way to make a system look assembled rather than designed.
   */
  weight?: IconWeight;
  /**
   * Describes the icon for assistive tech. Omit entirely when the icon is decorative
   * and the adjacent text already carries the meaning — the icon is then hidden rather
   * than read out as a duplicate.
   */
  label?: string;
  className?: string;
}

/**
 * Bold is the system weight: it matches the 2px sticker linework on buttons and cards.
 * Regular reads thin and clinical beside them.
 */
const SYSTEM_WEIGHT: IconWeight = 'bold';

export function Icon({
  icon: Glyph,
  size = 'sm',
  tone = 'inherit',
  weight = SYSTEM_WEIGHT,
  label,
  className,
}: IconProps) {
  const decorative = !label;

  return (
    <span
      className={['cf-icon', `cf-icon--${size}`, `cf-icon--${tone}`, className].filter(Boolean).join(' ')}
      // A decorative icon is hidden outright; a meaningful one is exposed with its label.
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      {/* size="100%" hands sizing to the CSS token rather than a hardcoded pixel prop. */}
      <Glyph size="100%" weight={weight} />
    </span>
  );
}
