import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import './Tabs.css';

/** Accent hue of the active pill — matches a Badge of the same hue. */
export type TabHue = 'purple' | 'teal' | 'orange' | 'pink' | 'neutral';

export interface TabItem {
  /** Stable identifier, returned via `onChange`. */
  value: string;
  label: string;
  /** The active pill's accent. A lit tab renders identically to `<Badge hue={hue} tone="bold">`. */
  hue?: TabHue;
  /**
   * `id` of the panel this tab controls, when the panel is rendered outside this component —
   * server-rendered markup, an island, a sibling section. Wires up `aria-controls`, and lets
   * the panel point back with `aria-labelledby={tabId(value)}`.
   */
  panelId?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  /** The selected tab's `value` (controlled). */
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the tablist — required. */
  'aria-label': string;
  /**
   * Also show and hide the elements named by `panelId`, by toggling their `hidden` attribute.
   *
   * Off by default, because reaching outside your own tree is a real cost and most consumers
   * render their panels in React and just want the wiring. Turn it on when the panels are
   * markup you do not control from here.
   *
   * `hidden` means `display: none`, so the panels do not reserve height and the page reflows
   * when they differ in length. If that matters, leave this off, keep `panelId` for the
   * `aria-controls` wiring, and drive visibility yourself.
   */
  managePanels?: boolean;
}

/**
 * A segmented control: a pill group with a sliding active indicator. The indicator is a
 * Badge — it consumes the same `--badge-*` tokens — so the active tab and a category Badge
 * of the same hue are pixel-for-pixel identical. Keyboard: arrows/Home/End move selection.
 *
 * Tabs deliberately does not render panels. Most consumers already have their content in
 * React and only want the control; those whose panels live elsewhere — server-rendered
 * markup, an island, a sibling section — give each tab a `panelId` to wire `aria-controls`,
 * and optionally set `managePanels` to have the panels shown and hidden too.
 */
export function Tabs({
  tabs,
  value,
  onChange,
  'aria-label': ariaLabel,
  managePanels = false,
}: TabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  // Scopes the generated tab ids, so two tablists sharing a `value` cannot collide.
  const uid = useId();
  const tabId = (v: string) => `${uid}-tab-${v}`;

  const activeHue = tabs.find((t) => t.value === value)?.hue ?? 'purple';

  /**
   * Show the active panel and hide the rest. This runs after paint, so author the markup with
   * the initial tab's panel already visible and the others already `hidden` — otherwise the
   * first frame shows every panel at once.
   */
  useEffect(() => {
    if (!managePanels) return;
    for (const t of tabs) {
      if (!t.panelId) continue;
      const panel = document.getElementById(t.panelId);
      if (panel) panel.toggleAttribute('hidden', t.value !== value);
    }
  }, [managePanels, tabs, value]);

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
            id={tabId(t.value)}
            aria-selected={on}
            aria-controls={t.panelId}
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
