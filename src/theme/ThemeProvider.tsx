import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Theme and mode are independent axes, combined by the CSS cascade at runtime
 * (data-theme + data-mode) — never a per-combination matrix. THEME governs
 * brand/accent; MODE governs neutrals + focus. Widening either union is a token
 * file plus one entry here; nothing else in the system needs to change.
 */
export type Theme = 'confetti' | 'ocean';
export type Mode = 'light' | 'dark' | 'high-contrast';

export const THEMES: Theme[] = ['confetti', 'ocean'];
export const MODES: Mode[] = ['light', 'dark', 'high-contrast'];

type ThemeContextValue = {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: ReactNode;
  theme?: Theme;
  mode?: Mode;
  /**
   * Where the data-theme / data-mode attributes get written. `root` themes the
   * whole document; `scope` themes only this subtree, which is what lets two
   * modes render side by side on one page.
   */
  target?: 'root' | 'scope';
};

export function ThemeProvider({
  children,
  theme: themeProp = 'confetti',
  mode: modeProp = 'light',
  target = 'root',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(themeProp);
  const [mode, setMode] = useState<Mode>(modeProp);

  // Follow controlled props when the consumer drives them (Storybook toolbar).
  useEffect(() => setTheme(themeProp), [themeProp]);
  useEffect(() => setMode(modeProp), [modeProp]);

  useEffect(() => {
    if (target !== 'root') return;
    const el = document.documentElement;
    el.setAttribute('data-theme', theme);
    el.setAttribute('data-mode', mode);
  }, [theme, mode, target]);

  const toggleMode = useCallback(
    () => setMode((current) => MODES[(MODES.indexOf(current) + 1) % MODES.length]),
    []
  );

  const value = useMemo(
    () => ({ theme, mode, setTheme, setMode, toggleMode }),
    [theme, mode, toggleMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {target === 'scope' ? (
        <div data-theme={theme} data-mode={mode}>
          {children}
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a <ThemeProvider>');
  return context;
}
