import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './WorkCard.css';

export type WorkCardTagHue = 'purple' | 'teal' | 'orange' | 'pink';

// `title` is widened from the DOM's string-only attribute to a ReactNode slot.
export interface WorkCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  /** The line beside the title — a date, a range, a year. */
  meta?: ReactNode;
  /** The image, or any element that should fill the frame. `<img>` and `<video>` are cropped to cover it. */
  media?: ReactNode;
  /** Category chip laid over the top-left of the media. The dot takes the hue. */
  tag?: { label: ReactNode; hue?: WorkCardTagHue };
  /** Sequence number laid over the top-right of the media, e.g. `01`. */
  index?: ReactNode;
  /** Media aspect ratio as a CSS `aspect-ratio` value. Wide cards use a wider ratio than a grid cell. */
  ratio?: CSSProperties['aspectRatio'];
  /** Renders the card as a link and adds the hover lift. */
  href?: string;
}

export function WorkCard({
  title,
  meta,
  media,
  tag,
  index,
  ratio = '4 / 3',
  href,
  className,
  style,
  ...rest
}: WorkCardProps) {
  const classes = ['cf-work-card', href && 'cf-work-card--interactive', className]
    .filter(Boolean)
    .join(' ');
  const frameStyle = { '--cf-work-card-ratio': ratio, ...style } as CSSProperties;

  const content = (
    <>
      <div className="cf-work-card__media">
        {media}
        {tag || index ? (
          <div className="cf-work-card__overlay">
            {tag ? (
              <span className={`cf-work-card__tag cf-work-card__tag--${tag.hue ?? 'purple'}`}>
                <span className="cf-work-card__dot" aria-hidden="true" />
                {tag.label}
              </span>
            ) : (
              <span />
            )}
            {index ? <span className="cf-work-card__index">{index}</span> : null}
          </div>
        ) : null}
      </div>
      <div className="cf-work-card__footer">
        <h3 className="cf-work-card__title">{title}</h3>
        {meta ? <span className="cf-work-card__meta">{meta}</span> : null}
      </div>
    </>
  );

  // A link when there is somewhere to go, otherwise a plain article — never a clickable div.
  return href ? (
    <a className={classes} style={frameStyle} href={href} {...(rest as HTMLAttributes<HTMLAnchorElement>)}>
      {content}
    </a>
  ) : (
    <article className={classes} style={frameStyle} {...rest}>
      {content}
    </article>
  );
}
