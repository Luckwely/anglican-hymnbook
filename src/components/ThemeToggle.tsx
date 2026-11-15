import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectThemeMode, themeToggled } from '../features/ui/themeSlice';
import { btnSecondary } from '../lib/ui';

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const dark = useAppSelector(selectThemeMode) === 'dark';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      className={`${btnSecondary} btn-icon no-print !border-0 !bg-neu-base !text-slate-700 !shadow-neu-btn active:!shadow-neu-pressed focus-visible:!shadow-neu-pressed hover:!bg-neu-base !rounded-xl transition-all duration-150`}
      onClick={() => dispatch(themeToggled())}
      aria-label={label}
      title={label}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
