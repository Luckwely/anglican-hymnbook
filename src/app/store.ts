import { configureStore, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';
import hymnsReducer from '../features/hymns/hymnsSlice';
import playerReducer from '../features/player/playerSlice';
import themeReducer, { THEME_KEY } from '../features/ui/themeSlice';
import favoritesReducer, { FAVORITES_KEY } from '../features/ui/favoritesSlice';
import { applyTheme } from '../lib/theme';
import { saveJSON } from '../lib/storage';

export const store = configureStore({
  reducer: {
    hymns: hymnsReducer,
    player: playerReducer,
    theme: themeReducer,
    favorites: favoritesReducer,
  },
});

/* Apply the theme at startup, then persist theme + favourites whenever they change. */
let prevMode = store.getState().theme.mode;
let prevFavs = store.getState().favorites.numbers;
applyTheme(prevMode);
store.subscribe(() => {
  const { theme, favorites } = store.getState();
  if (theme.mode !== prevMode) {
    prevMode = theme.mode;
    applyTheme(prevMode);
    saveJSON(THEME_KEY, prevMode);
  }
  if (favorites.numbers !== prevFavs) {
    prevFavs = favorites.numbers;
    saveJSON(FAVORITES_KEY, prevFavs);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;
