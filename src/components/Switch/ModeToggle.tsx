import { Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from '../../theme/ThemeProvider';
import { Switch } from './Switch';

export interface ModeToggleProps {
  /** Visible text beside the control. Pass `null` for the switch on its own. */
  label?: string | null;
}

/**
 * The light/dark control — a `Switch` wired to `ThemeProvider`.
 *
 * `ThemeProvider` has always owned the mode and exposed `toggleMode()`, but the system
 * shipped nothing to call it: every consumer built its own toggle, which is how a design
 * system ends up with four of them. This is that control, once.
 *
 * It must sit inside a `ThemeProvider` — `useTheme()` throws otherwise, deliberately, since a
 * mode toggle with nothing to toggle is a bug rather than a degraded state.
 */
export function ModeToggle({ label = 'Dark mode' }: ModeToggleProps) {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <Switch
      checked={isDark}
      onChange={toggleMode}
      iconOn={Moon}
      iconOff={Sun}
      aria-label={label ? undefined : 'Dark mode'}
    >
      {label ?? undefined}
    </Switch>
  );
}
