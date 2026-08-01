import type { ReactNode } from 'react';
import {
  CheckCircleIcon as CheckCircle,
  InfoIcon as Info,
  WarningCircleIcon as WarningCircle,
  XIcon as X,
} from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { Icon, type PhosphorIcon } from '../Icon/Icon';
import './Toast.css';

/** What the toast is telling you. `neutral` is the default — information, not an outcome. */
export type ToastTone = 'success' | 'danger' | 'neutral';

export interface ToastProps {
  tone?: ToastTone;
  /** Short outcome line — "Changes saved". Keep it to a few words. */
  title: string;
  /** Optional second line with the detail. */
  children?: ReactNode;
  /** Omit to render a toast that cannot be dismissed (one on a timer, say). */
  onDismiss?: () => void;
  /** A single control — "Undo", "View". More than one belongs in a dialog, not a toast. */
  action?: ReactNode;
}

const TONE_ICON: Record<ToastTone, PhosphorIcon> = {
  success: CheckCircle,
  danger: WarningCircle,
  neutral: Info,
};

/**
 * A transient notification. Card-weight paper with a tone carried by the leading edge and
 * the icon rather than by a coloured fill, so the inside of a toast is an ordinary surface:
 * body text, muted text and a ghost dismiss button all behave exactly as they do elsewhere.
 *
 * Two things it deliberately does NOT do, because they belong to the application and not to
 * a design system: it does not position itself, and it does not manage a queue or a timer.
 * Render it inside whatever fixed container the app uses and control its lifetime there —
 * the same division of labour as Modal, where the parent owns `open`.
 *
 * Announcement is handled, though, since that is a property of the component and easy to get
 * wrong: a failure takes `role="alert"` (assertive — it interrupts), and everything else
 * takes `role="status"` (polite — it waits for a pause). The icon is decorative because the
 * title already carries the meaning in text.
 */
export function Toast({ tone = 'neutral', title, children, onDismiss, action }: ToastProps) {
  const isAlert = tone === 'danger';

  return (
    <div
      className={['cf-toast', `cf-toast--${tone}`].join(' ')}
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
    >
      <Icon icon={TONE_ICON[tone]} size="md" className="cf-toast__icon" />

      <div className="cf-toast__content">
        <p className="cf-toast__title">{title}</p>
        {children ? <div className="cf-toast__body">{children}</div> : null}
      </div>

      {action ? <div className="cf-toast__action">{action}</div> : null}

      {onDismiss ? (
        <Button variant="ghost" aria-label="Dismiss notification" onClick={onDismiss}>
          <Icon icon={X} size="md" />
        </Button>
      ) : null}
    </div>
  );
}
