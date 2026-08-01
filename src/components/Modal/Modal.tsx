import { useId, type ReactNode } from 'react';
import { XIcon as X } from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Overlay } from '../Overlay/Overlay';
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
 * A dialog: `Overlay` plus a Card-weight panel.
 *
 * Everything about being above the page — the native `<dialog>`, the focus trap, `inert`,
 * Escape, the top layer, the scrim and the scroll lock — lives in `Overlay` and is shared
 * with every other surface built on it. What Modal adds is the panel: the card fill, sticker
 * border, container radius and hard offset shadow, plus the header / body / footer slots.
 *
 * Reach for Overlay directly when the thing on the scrim is not a panel — an image viewer, a
 * sheet, a menu.
 */
export function Modal({ open, onClose, title, size = 'md', children, footer }: ModalProps) {
  const titleId = useId();

  return (
    <Overlay
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className={`cf-modal cf-modal--${size}`}
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
    </Overlay>
  );
}
