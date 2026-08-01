import { useId, useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import './Slider.css';

export interface SliderProps {
  /** Controlled — the parent owns the value. */
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Granularity of every change, including keyboard steps. */
  step?: number;
  /** Visible text beside the control. */
  children?: ReactNode;
  /** Accessible name when there is no visible label. */
  'aria-label'?: string;
  /**
   * Spoken instead of the bare number, for a value whose unit or meaning isn't obvious —
   * "40 percent", "3 of 7". Rendered beside the control too, when `showValue` is on.
   */
  formatValue?: (value: number) => string;
  /** Show the formatted value beside the rail. */
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Snap to the nearest step, then round away the float dust `0.1 + 0.2` leaves behind. */
function quantise(raw: number, min: number, max: number, step: number) {
  const snapped = min + Math.round((raw - min) / step) * step;
  const decimals = (String(step).split('.')[1] ?? '').length;
  return clamp(Number(snapped.toFixed(decimals)), min, max);
}

/**
 * A value chosen by dragging along a rail — volume, a threshold, a rating.
 *
 * The knob is the focusable element and carries `role="slider"`, so assistive tech reads the
 * value rather than "button", and the platform's own slider shortcuts apply: arrows step,
 * Page Up/Down jump, Home and End go to the ends.
 *
 * Pointer and keyboard are equal citizens here, which is the part hand-rolled sliders
 * usually miss — a drag-only control is unusable without a mouse. Dragging uses pointer
 * capture, so the value keeps tracking when the pointer leaves the rail mid-gesture.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  children,
  'aria-label': ariaLabel,
  formatValue,
  showValue = false,
  disabled = false,
  className,
}: SliderProps) {
  const labelId = useId();
  const trackRef = useRef<HTMLDivElement>(null);

  const current = clamp(value, min, max);
  const fraction = max === min ? 0 : (current - min) / (max - min);
  const text = formatValue?.(current);

  const setFromPointer = (clientX: number) => {
    const rail = trackRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const next = quantise(min + ratio * (max - min), min, max, step);
    if (next !== current) onChange(next);
  };

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    // Capture on the rail so a drag that wanders off the control keeps updating.
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromPointer(e.clientX);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setFromPointer(e.clientX);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const big = step * 10;
    let next = current;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - step;
        break;
      case 'PageUp':
        next = current + big;
        break;
      case 'PageDown':
        next = current - big;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    next = quantise(next, min, max, step);
    if (next !== current) onChange(next);
  }

  return (
    <div className={['cf-slider', className].filter(Boolean).join(' ')}>
      {children ? (
        <span className="cf-slider__label" id={labelId}>
          {children}
        </span>
      ) : null}

      <div
        className="cf-slider__rail"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        /* The rail is the drag surface; the knob inside it is the control. */
        style={{ ['--cf-slider-fraction' as string]: fraction }}
      >
        <span className="cf-slider__fill" aria-hidden="true" />
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={text}
          aria-label={children ? undefined : ariaLabel}
          aria-labelledby={children ? labelId : undefined}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown}
          className="cf-slider__thumb"
        />
      </div>

      {showValue ? <span className="cf-slider__value">{text ?? current}</span> : null}
    </div>
  );
}
