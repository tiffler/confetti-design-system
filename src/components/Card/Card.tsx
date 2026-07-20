import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export type CardSurface = 'card' | 'raised';

// `title` is widened from the DOM's string-only attribute to a ReactNode slot.
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional mono eyebrow above the title. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Adds the hover lift + hard shadow. Use for cards that link somewhere. */
  interactive?: boolean;
  /** `raised` uses the paper-raised surface instead of the card interior. */
  surface?: CardSurface;
  children?: ReactNode;
}

export function Card({
  eyebrow,
  title,
  interactive = false,
  surface = 'card',
  children,
  className,
  ...rest
}: CardProps) {
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
      {...rest}
    >
      {eyebrow ? <span className="cf-card__eyebrow">{eyebrow}</span> : null}
      {title ? <h3 className="cf-card__title">{title}</h3> : null}
      {children ? <div className="cf-card__body">{children}</div> : null}
    </div>
  );
}
