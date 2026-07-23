import { useEffect, useState } from 'react';
import { addons } from 'storybook/preview-api';
import tokenIndex from '../../build/portfolio/tokens.json';
import type { Theme, Mode } from '../theme/ThemeProvider';

export type TokenRecord = {
  value: string;
  path: string[];
  comment: string | null;
};

type TokenIndex = Record<string, Record<string, TokenRecord>>;
type ThemeGlobals = { theme: Theme; mode: Mode };

const DEFAULTS: ThemeGlobals = { theme: 'confetti', mode: 'light' };

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
 * Foundations pages cannot use `useGlobals` — that is a preview hook, valid
 * only inside decorators and story functions, and MDX prose renders outside
 * both. So we read the toolbar state off the addons channel instead: the URL
 * seeds the initial value, then SET_GLOBALS / GLOBALS_UPDATED keep it live.
 */
export function useThemeGlobals(): ThemeGlobals {
  const [globals, setGlobals] = useState<ThemeGlobals>(() => ({
    ...DEFAULTS,
    ...readGlobalsFromUrl(),
  }));

  useEffect(() => {
    const channel = addons.getChannel();

    const apply = (payload: { globals?: Partial<ThemeGlobals> } | Partial<ThemeGlobals>) => {
      const next = (payload as { globals?: Partial<ThemeGlobals> })?.globals ?? payload;
      if (!next) return;
      setGlobals((current) => ({
        theme: (next as ThemeGlobals).theme ?? current.theme,
        mode: (next as ThemeGlobals).mode ?? current.mode,
      }));
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
 */
export function useThemeAttrs(): { 'data-theme': Theme; 'data-mode': Mode } {
  const { theme, mode } = useThemeGlobals();
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
