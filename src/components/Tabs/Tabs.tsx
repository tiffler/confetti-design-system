import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import './Tabs.css';

/** Accent hue of the active pill — matches a Badge of the same hue. */
export type TabHue = 'purple' | 'teal' | 'orange' | 'pink' | 'neutral';

export interface TabItem {
  /** Stable identifier, returned via `onChange`. */
  value: string;
  label: string;
  /** The active pill's accent. A lit tab renders identically to `<Badge hue={hue} tone="bold">`. */
  hue?: TabHue;
}

export interface TabsProps {
  tabs: TabItem[];
  /** The selected tab's `value` (controlled). */
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the tablist — required. */
  'aria-label': string;
}

/**
 * A segmented control: a pill group with a sliding active indicator. The indicator is a
 * Badge — it consumes the same `--badge-*` tokens — so the active tab and a category Badge
 * of the same hue are pixel-for-pixel identical. Keyboard: arrows/Home/End move selection.
 */
export function Tabs({ tabs, value, onChange, 'aria-label': ariaLabel }: TabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const activeHue = tabs.find((t) => t.value === value)?.hue ?? 'purple';

  useEffect(() => {
    const move = () => {
      const el = tabRefs.current[value];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    move();
    window.addEventListener('resize', move);
    // Re-measure once webfonts land, so the pill doesn't sit on the fallback metrics.
    if (document.fonts?.ready) void document.fonts.ready.then(move);
    return () => window.removeEventListener('resize', move);
  }, [value, tabs]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const i = tabs.findIndex((t) => t.value === value);
    let next = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    const nextTab = tabs[next];
    onChange(nextTab.value);
    tabRefs.current[nextTab.value]?.focus();
  }

  return (
    <div className={`cf-tabs cf-tabs--${activeHue}`} role="tablist" aria-label={ariaLabel}>
      {indicator && (
        <span
          aria-hidden="true"
          className={`cf-tabs__indicator cf-tabs__indicator--${activeHue}`}
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              tabRefs.current[t.value] = el;
            }}
            type="button"
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            className="cf-tabs__tab"
            onClick={() => onChange(t.value)}
            onKeyDown={onKeyDown}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
