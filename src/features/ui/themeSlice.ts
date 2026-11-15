import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { loadJSON } from '../../lib/storage';
import type { ThemeMode } from '../../lib/theme';

export const THEME_KEY = 'karoly.theme';

function initialMode(): ThemeMode {
  const saved = loadJSON<ThemeMode | null>(THEME_KEY, null);
  if (saved === 'light' || saved === 'dark') return saved;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initialMode() as ThemeMode },
  reducers: {
    themeToggled(state) { state.mode = state.mode === 'dark' ? 'light' : 'dark'; },
  },
});

export const { themeToggled } = themeSlice.actions;
export default themeSlice.reducer;
export const selectThemeMode = (s: RootState) => s.theme.mode;
