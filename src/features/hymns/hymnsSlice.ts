import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { searchHymns } from '../../lib/hymns';
import { selectFavorites } from '../ui/favoritesSlice';

export type SheetView = 'solfa' | 'staff';

interface HymnsState {
  query: string;
  view: SheetView;
  favoritesOnly: boolean;
}

const initialState: HymnsState = { query: '', view: 'solfa', favoritesOnly: false };

const hymnsSlice = createSlice({
  name: 'hymns',
  initialState,
  reducers: {
    queryChanged(state, action: PayloadAction<string>) { state.query = action.payload; },
    viewChanged(state, action: PayloadAction<SheetView>) { state.view = action.payload; },
    favoritesOnlyToggled(state) { state.favoritesOnly = !state.favoritesOnly; },
  },
});

export const { queryChanged, viewChanged, favoritesOnlyToggled } = hymnsSlice.actions;
export default hymnsSlice.reducer;

export const selectQuery = (s: RootState) => s.hymns.query;
export const selectView = (s: RootState) => s.hymns.view;
export const selectFavoritesOnly = (s: RootState) => s.hymns.favoritesOnly;
/** Memoised: recomputes only when query, filter or favourites change. */
export const selectFilteredHymns = createSelector(
  [selectQuery, selectFavoritesOnly, selectFavorites],
  (q, onlyFavs, favs) => {
    const found = searchHymns(q);
    return onlyFavs ? found.filter(h => favs.includes(h.hymnNumber)) : found;
  },
);
