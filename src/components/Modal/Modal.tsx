import { useEffect, useId, useRef, type ReactNode, type MouseEvent, type SyntheticEvent } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import './Modal.css';

/** `sm` for a confirmation, `md` for a dialog with real content. */
export type ModalSize = 'sm' | 'md';

export interface ModalProps {
  /** Controlled: the parent owns the open state, the dialog never closes itself. */
  open: boolean;
  /** Called for every dismissal route — Escape, the close button, a click on the scrim. */
  onClose: () => void;
  /** Names the dialog for assistive tech (wired up as `aria-labelledby`) — required. */
  title: string;
  size?: ModalSize;
  children: ReactNode;
  /** Actions, laid out end-aligned below the body. Usually one or two `<Button>`s. */
  footer?: ReactNode;
}

/**
 * A dialog built on the native `<dialog>` element, opened with `showModal()`. The platform
 * supplies the parts that are easy to hand-roll badly: a real focus trap, `inert` on
 * everything behind it, Escape handling, and the top layer — so the panel can never be
 * clipped or out-stacked by an ancestor, and needs no z-index of its own.
 *
 * The element itself is the scrim: it fills the viewport and paints `--modal-scrim-bg`, so
 * a click that misses the panel lands on it and dismisses. Custom properties still inherit
 * down the DOM tree (the top layer changes painting, not ancestry), so a Modal inside a
 * scoped `ThemeProvider` keeps that scope's theme rather than the document's.
 */
export function Modal({ open, onClose, title, size = 'md', children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Guard on el.open — showModal() on an already-open dialog throws.
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // showModal() makes the rest of the page inert, but it does not stop the page behind
  // from scrolling. Lock it, and restore whatever the app had set rather than clearing.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /**
   * Escape fires `cancel`, whose default is to close the dialog in the DOM — which would
   * put the element out of sync with the `open` prop. Preventing it keeps this a properly
   * controlled component: every route out goes through `onClose`, and the parent decides.
   */
  function handleCancel(e: SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    onClose();
  }

  // The panel is a child, so a click landing on the dialog itself came from the scrim.
  function handleClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <dialog
      ref={ref}
      className={`cf-modal cf-modal--${size}`}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className="cf-modal__panel">
        <header className="cf-modal__header">
          <h2 className="cf-modal__title" id={titleId}>
            {title}
          </h2>
          <Button variant="ghost" aria-label="Close" onClick={onClose}>
            <Icon icon={X} size="md" />
          </Button>
        </header>

        <div className="cf-modal__body">{children}</div>

        {footer && <footer className="cf-modal__footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
