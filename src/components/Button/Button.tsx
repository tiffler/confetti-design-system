import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import { Icon } from '../Icon/Icon';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primary = red fill. Secondary = paper fill with ink border. Ghost = text only. */
  variant?: ButtonVariant;
  children: ReactNode;
}

/**
 * Dev-only accessibility guard. A button whose only content is a decorative icon — an
 * `<Icon>` with no `label` — and which has no `aria-label`/`aria-labelledby` has no
 * accessible name: a screen reader announces "button" and nothing else. Warn so it's
 * caught in development. The whole call is behind `import.meta.env.DEV`, so it's stripped
 * from production builds.
 */
function warnIfUnnamedIconButton(
  children: ReactNode,
  rest: ButtonHTMLAttributes<HTMLButtonElement>
) {
  // An aria-label / aria-labelledby already names the button — nothing to warn about.
  if (rest['aria-label'] != null || rest['aria-labelledby'] != null) return;

  const items = Children.toArray(children).filter(
    (child) => !(typeof child === 'string' && child.trim() === '')
  );
  if (items.length === 0) return;

  // Any visible text gives the button a name.
  if (items.some((child) => typeof child === 'string' || typeof child === 'number')) return;

  // Left with elements only — flag when they're all decorative Icons (no label).
  const onlyDecorativeIcons = items.every(
    (child) => isValidElement(child) && child.type === Icon && !(child.props as { label?: string }).label
  );
  if (onlyDecorativeIcons) {
    console.warn(
      '[Confetti] <Button> has an icon but no accessible name — screen readers will announce ' +
        'only "button". Add an `aria-label` to the <Button>, or a `label` to the <Icon>.'
    );
  }
}

export function Button({ variant = 'primary', children, className, ...rest }: ButtonProps) {
  if (import.meta.env.DEV) {
    warnIfUnnamedIconButton(children, rest);
  }

  return (
    <button
      type="button"
      className={['cf-button', `cf-button--${variant}`, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
