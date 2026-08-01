import { useEffect, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react';
import './Overlay.css';

/** Where the content sits on the scrim. `bottom` is the mobile-sheet position. */
export type OverlayPlacement = 'center' | 'bottom';

export interface OverlayProps {
  /** Controlled: the parent owns the open state. The overlay never closes itself. */
  open: boolean;
  /** Called for every dismissal route — Escape, and a click on the scrim. */
  onClose: () => void;
  /** Accessible name. Use this or `labelledBy`; one of the two is required. */
  label?: string;
  /** Id of an element that names the overlay — for content with a visible heading. */
  labelledBy?: string;
  placement?: OverlayPlacement;
  /** Set false when a stray click outside the content must not dismiss (a destructive flow). */
  dismissOnScrimClick?: boolean;
  /** Applied to the scrim element, so a consumer can size or position its own surface. */
  className?: string;
  children: ReactNode;
}

/**
 * The full-viewport dim that above-the-page surfaces sit on — and the only place in the
 * system that dialog behaviour is implemented.
 *
 * It is a native `<dialog>` opened with `showModal()`, which is what makes it worth having:
 * the platform supplies a real focus trap, `inert` on everything behind, Escape handling, and
 * the top layer — so the content can never be clipped or out-stacked by an ancestor and needs
 * no z-index. Hand-rolled overlays get some of that and quietly miss the rest; the usual
 * casualties are the focus trap and `inert`.
 *
 * The element itself is the scrim, so a click that misses the content lands on it and
 * dismisses. It paints no fill, border or radius — whatever you place on it brings its own.
 * `Modal` is exactly this plus a Card-weight panel.
 */
export function Overlay({
  open,
  onClose,
  label,
  labelledBy,
  placement = 'center',
  dismissOnScrimClick = true,
  className,
  children,
}: OverlayProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Guard on el.open — showModal() on an already-open dialog throws.
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // showModal() makes the rest of the page inert, but it does not stop the page behind from
  // scrolling. Lock it, and restore whatever the app had set rather than clearing.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /**
   * Escape fires `cancel`, whose default is to close the dialog in the DOM — which would put
   * the element out of sync with the `open` prop. Preventing it keeps this properly
   * controlled: every route out goes through `onClose`, and the parent decides.
   */
  function handleCancel(e: SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    onClose();
  }

  // The content is a child, so a click landing on the dialog itself came from the scrim.
  function handleClick(e: MouseEvent<HTMLDialogElement>) {
    if (dismissOnScrimClick && e.target === e.currentTarget) onClose();
  }

  return (
    <dialog
      ref={ref}
      className={['cf-overlay', `cf-overlay--${placement}`, className].filter(Boolean).join(' ')}
      // A dialog opened with showModal() is already `aria-modal`; it just needs a name.
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      {children}
    </dialog>
  );
}
