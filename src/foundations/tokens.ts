import { useEffect, useState } from 'react';
import { addons } from 'storybook/preview-api';
import tokenIndex from '../../build/portfolio/tokens.json';
import { DEFAULT_THEME, DEFAULT_MODE, type Theme, type Mode } from '../theme/ThemeProvider';

export type TokenRecord = {
  value: string;
  path: string[];
  comment: string | null;
};

type TokenIndex = Record<string, Record<string, TokenRecord>>;
type ThemeGlobals = { theme: Theme; mode: Mode };

const DEFAULTS: ThemeGlobals = { theme: DEFAULT_THEME, mode: DEFAULT_MODE };

// Event name literals rather than the @storybook/core-events import, whose
// module path has moved between Storybook majors.
const SET_GLOBALS = 'setGlobals';
const GLOBALS_UPDATED = 'globalsUpdated';

/** Preview iframe URL carries `globals=theme:confetti;mode:dark`. */
function readGlobalsFromUrl(): Partial<ThemeGlobals> {
  if (typeof window === 'undefined') return {};
  const raw = new URLSearchParams(window.location.search).get('globals');
  if (!raw) return {};

  return Object.fromEntries(
    raw
      .split(';')
      .map((pair) => pair.split(':'))
      .filter(([key, value]) => key && value)
  ) as Partial<ThemeGlobals>;
}

/**
 * Last known toolbar state, held at module scope so it survives a remount.
 *
 * This has to outlive the components. Changing a global makes Storybook rewrite the
 * preview URL and remount the docs page, so a `useState` initializer that reads the URL
 * runs again on every toggle — and the URL is not a reliable mirror of the toolbar.
 * Storybook only writes a `globals` param for values that differ from `initialGlobals`,
 * so switching to dark adds `globals=mode:dark` while switching back to light never
 * clears it. The remount then re-seeded `dark` from the stale URL and clobbered the
 * correct value the channel had just delivered — mode toggled one way and stuck.
 * Seeding from this cache instead means a remount resumes from the live value.
 */
let lastKnown: ThemeGlobals = { ...DEFAULTS, ...readGlobalsFromUrl() };

/**
 * Foundations pages cannot use `useGlobals` — that is a preview hook, valid
 * only inside decorators and story functions, and MDX prose renders outside
 * both. So we read the toolbar state off the addons channel instead: the cache
 * above seeds the initial value, then SET_GLOBALS / GLOBALS_UPDATED keep it live.
 */
export function useThemeGlobals(): ThemeGlobals {
  const [globals, setGlobals] = useState<ThemeGlobals>(lastKnown);

  useEffect(() => {
    const channel = addons.getChannel();

    const apply = (payload: { globals?: Partial<ThemeGlobals> } | Partial<ThemeGlobals>) => {
      const next = (payload as { globals?: Partial<ThemeGlobals> })?.globals ?? payload;
      if (!next) return;
      lastKnown = {
        theme: (next as ThemeGlobals).theme ?? lastKnown.theme,
        mode: (next as ThemeGlobals).mode ?? lastKnown.mode,
      };
      setGlobals(lastKnown);
    };

    channel.on(SET_GLOBALS, apply);
    channel.on(GLOBALS_UPDATED, apply);
    return () => {
      channel.off(SET_GLOBALS, apply);
      channel.off(GLOBALS_UPDATED, apply);
    };
  }, []);

  return globals;
}

/**
 * Specimens must carry the theme attributes themselves, for the same reason —
 * spread this onto a specimen's root so its var() references resolve.
 *
 * The wrapper attributes alone are not enough, though. The theme WIRING
 * (`--color-accent-purple-bold: var(--accent-purple)` and friends) is declared once
 * under `:root`, and a `var()` is substituted where a property is DECLARED, not where
 * it is used — so a wrapper only inherits whatever `:root` already resolved. Foundations
 * pages have no stories, so no ThemeProvider ever runs in the docs iframe and `<html>`
 * carries no attributes at all: every wired role resolves against missing inputs and
 * computes to nothing, which strips specimens of their accent fills, borders, radii and
 * fonts while mode-independent values (the spacing ramp) keep working. Mirror the toolbar
 * onto the docs root so the wiring has its inputs.
 */
export function useThemeAttrs(): { 'data-theme': Theme; 'data-mode': Mode } {
  const { theme, mode } = useThemeGlobals();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
    // Deliberately not cleaned up on unmount: ThemeProvider owns these same attributes in
    // the story canvas, and clearing them here would blank the page between renders.
  }, [theme, mode]);

  return { 'data-theme': theme, 'data-mode': mode };
}

/**
 * The generated token index, keyed `theme.mode`. Foundations read this rather
 * than hardcoding values, so the docs cannot drift from the build output.
 */
export function useTokens(): Record<string, TokenRecord> {
  const { theme, mode } = useThemeGlobals();
  const index = tokenIndex as unknown as TokenIndex;
  return index[`${theme}.${mode}`] ?? {};
}

/** All tokens whose name starts with `prefix`, in source order. */
export function useTokenGroup(prefix: string): Array<[string, TokenRecord]> {
  const tokens = useTokens();
  return Object.entries(tokens).filter(([name]) => name.startsWith(prefix));
}

/**
 * Exact token names, in the order given. Prefix matching is greedy —
 * `space-1` also catches `space-10` — so scales that need a specific set
 * enumerate it instead.
 */
export function useTokenList(names: string[]): Array<[string, TokenRecord]> {
  const tokens = useTokens();
  return names.filter((name) => tokens[name]).map((name) => [name, tokens[name]]);
}
