import type { HTMLAttributes, ReactNode } from 'react';
import './DarkPanel.css';

// `title` is widened from the DOM's string-only attribute to a ReactNode slot.
export interface DarkPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  /** Heading level for the title, so the panel slots into any document outline. */
  titleAs?: 'h2' | 'h3' | 'h4';
  /** Actions, end-aligned beside the content. Usually one or two `<Button>`s. */
  actions?: ReactNode;
  /** Sits under the title — supporting copy, a row of icons, links. */
  children?: ReactNode;
}

export function DarkPanel({
  title,
  titleAs: Title = 'h2',
  actions,
  children,
  className,
  ...rest
}: DarkPanelProps) {
  return (
    <section className={['cf-dark-panel', className].filter(Boolean).join(' ')} {...rest}>
      <div className="cf-dark-panel__main">
        <Title className="cf-dark-panel__title">{title}</Title>
        {children ? <div className="cf-dark-panel__body">{children}</div> : null}
      </div>
      {actions ? <div className="cf-dark-panel__actions">{actions}</div> : null}
    </section>
  );
}
