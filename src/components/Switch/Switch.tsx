import { useId, type ReactNode } from 'react';
import { Icon, type PhosphorIcon } from '../Icon/Icon';
import './Switch.css';

export interface SwitchProps {
  /** Controlled — the parent owns the value. */
  checked: boolean;
  onChange: (checked: boolean) => void;
  /**
   * Visible text beside the control. Omit it only when `aria-label` names the switch some
   * other way — a control with no accessible name announces as "switch" and nothing else.
   */
  children?: ReactNode;
  /** Accessible name when there is no visible label. */
  'aria-label'?: string;
  /** Optional glyph carried on the thumb, swapping with the state (sun ↔ moon, say). */
  iconOn?: PhosphorIcon;
  iconOff?: PhosphorIcon;
  disabled?: boolean;
  className?: string;
}

/**
 * A binary control that takes effect the moment you flip it — dark mode, a preference, a
 * feature toggle. That immediacy is what separates it from a checkbox, which stages a value
 * until something is submitted; if the change needs an "Apply", it is a checkbox.
 *
 * `role="switch"` with `aria-checked` rather than a styled `<input type="checkbox">`: the
 * role announces as "on/off" instead of "checked/unchecked", which is what the control
 * actually means, and it keeps the thumb and track as real elements to animate.
 *
 * The two states differ in track fill, in thumb fill, and in which end the thumb sits at —
 * so the state is never carried by colour alone.
 */
export function Switch({
  checked,
  onChange,
  children,
  'aria-label': ariaLabel,
  iconOn,
  iconOff,
  disabled,
  className,
}: SwitchProps) {
  const labelId = useId();
  const glyph = checked ? iconOn : iconOff;

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      /* Named by the visible text when there is one. Explicitly, via `aria-labelledby`,
         rather than by relying on the wrapping <label>: a <button> is a labelable element on
         paper, but screen-reader support for naming one that way is patchy. */
      aria-label={children ? undefined : ariaLabel}
      aria-labelledby={children ? labelId : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={['cf-switch', className].filter(Boolean).join(' ')}
    >
      <span className="cf-switch__thumb" aria-hidden="true">
        {glyph ? <Icon icon={glyph} size="sm" className="cf-switch__icon" /> : null}
      </span>
    </button>
  );

  if (!children) return control;

  // The <label> stays for its activation behaviour — clicking the text flips the switch.
  return (
    <label className="cf-switch-field">
      {control}
      <span className="cf-switch-field__label" id={labelId}>
        {children}
      </span>
    </label>
  );
}
