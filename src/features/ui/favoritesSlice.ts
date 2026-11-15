import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { loadJSON } from '../../lib/storage';

export const FAVORITES_KEY = 'karoly.favorites';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { numbers: loadJSON<number[]>(FAVORITES_KEY, []) },
  reducers: {
    favoriteToggled(state, action: PayloadAction<number>) {
      const n = action.payload;
      state.numbers = state.numbers.includes(n) ? state.numbers.filter(x => x !== n) : [...state.numbers, n];
    },
  },
});

export const { favoriteToggled } = favoritesSlice.actions;
export default favoritesSlice.reducer;
export const selectFavorites = (s: RootState) => s.favorites.numbers;
