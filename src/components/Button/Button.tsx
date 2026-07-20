import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primary = red fill. Secondary = paper fill with ink border. Ghost = text only. */
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className, ...rest }: ButtonProps) {
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
