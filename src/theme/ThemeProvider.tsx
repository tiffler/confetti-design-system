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
 * Skin and mode are independent axes. Confetti is the only skin today; the
 * union is what future skins widen, and nothing else in the system needs to
 * change when they do.
 */
export type Skin = 'confetti';
export type Mode = 'light' | 'dark';

export const SKINS: Skin[] = ['confetti'];
export const MODES: Mode[] = ['light', 'dark'];

type ThemeContextValue = {
  skin: Skin;
  mode: Mode;
  setSkin: (skin: Skin) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: ReactNode;
  skin?: Skin;
  mode?: Mode;
  /**
   * Where the data-skin / data-mode attributes get written. `root` themes the
   * whole document; `scope` themes only this subtree, which is what lets two
   * modes render side by side on one page.
   */
  target?: 'root' | 'scope';
};

export function ThemeProvider({
  children,
  skin: skinProp = 'confetti',
  mode: modeProp = 'light',
  target = 'root',
}: ThemeProviderProps) {
  const [skin, setSkin] = useState<Skin>(skinProp);
  const [mode, setMode] = useState<Mode>(modeProp);

  // Follow controlled props when the consumer drives them (Storybook toolbar).
  useEffect(() => setSkin(skinProp), [skinProp]);
  useEffect(() => setMode(modeProp), [modeProp]);

  useEffect(() => {
    if (target !== 'root') return;
    const el = document.documentElement;
    el.setAttribute('data-skin', skin);
    el.setAttribute('data-mode', mode);
  }, [skin, mode, target]);

  const toggleMode = useCallback(
    () => setMode((current) => (current === 'light' ? 'dark' : 'light')),
    []
  );

  const value = useMemo(
    () => ({ skin, mode, setSkin, setMode, toggleMode }),
    [skin, mode, toggleMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {target === 'scope' ? (
        <div data-skin={skin} data-mode={mode}>
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
