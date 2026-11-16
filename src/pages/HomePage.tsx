import { Link } from 'react-router-dom';
import { Heart, Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  favoritesOnlyToggled, queryChanged, selectFavoritesOnly, selectFilteredHymns, selectQuery,
} from '../features/hymns/hymnsSlice';
import { favoriteToggled, selectFavorites } from '../features/ui/favoritesSlice';
import { ThemeToggle } from '../components/ThemeToggle';
import { hymns } from '../lib/hymns';
import { routes } from '../lib/routes';
import { chip } from '../lib/ui';

export function HomePage() {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectQuery);
  const results = useAppSelector(selectFilteredHymns);
  const favorites = useAppSelector(selectFavorites);
  const favoritesOnly = useAppSelector(selectFavoritesOnly);

  return (
    <main className="app-main max-w-3xl min-h-dvh bg-neu-base text-slate-800">
      <header className="mb-3 flex items-start gap-2 sm:mb-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-700 sm:text-xs">Anglican Hymnbook</p>
          <h1 className="mt-0.5 text-xl font-bold sm:text-3xl">Karoly</h1>
          <p className="text-xs text-slate-600 sm:text-sm">{hymns.length} songs</p>
        </div>
        {/* <ThemeToggle /> */}
      </header>

      <div className="mb-2 flex items-center gap-2 sm:mb-4">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="search"
            value={query}
            onChange={e => dispatch(queryChanged(e.target.value))}
            placeholder="Search by title or number…"
            aria-label="Search karoly by title or number"
            className="w-full rounded-xl border-0 bg-neu-base py-2 pl-9 pr-9 text-sm text-slate-800 shadow-neu-pressed-sm outline-none focus:outline-none focus:shadow-neu-pressed sm:py-3 sm:text-base"
            style={{ color: 'var(--text)' }}
          />
          {query && (
            <button
              type="button"
              onClick={() => dispatch(queryChanged(''))}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-neu-base p-1 text-slate-600 shadow-neu-btn transition-all duration-150 active:shadow-neu-pressed"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="button"
          aria-pressed={favoritesOnly}
          onClick={() => dispatch(favoritesOnlyToggled())}
          className={`${chip(favoritesOnly)} gap-1 !px-2.5 !rounded-xl !border-0 !bg-neu-base !text-slate-700 !shadow-neu-btn active:!shadow-neu-pressed transition-all duration-150`}
          style={{ height: '2.25rem', textTransform: 'none' }}
        >
          <Heart size={14} fill={favoritesOnly ? 'currentColor' : 'none'} />
          Favoris {favorites.length > 0 && <span>({favorites.length})</span>}
        </button>
      </div>

      {results.length === 0 ? (
        <p className="py-10 text-center text-slate-600">
          {favoritesOnly && !query ? 'No favourites yet — tap the heart on a song.' : `No karoly found for “${query}”.`}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-neu-base shadow-neu-flat">
          {results.map((h, i) => {
            const fav = favorites.includes(h.hymnNumber);
            return (
              <li key={h.id} className={`flex items-center ${i > 0 ? 'shadow-[inset_0_2px_3px_-2px_#b8b9be]' : ''}`}>
                <Link
                  to={routes.hymn(h.hymnNumber)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-slate-800 outline-none transition-all duration-150 hover:shadow-neu-pressed-sm focus-visible:shadow-neu-pressed-sm sm:gap-4 sm:px-4 sm:py-3"
                >
                  <span className="w-10 shrink-0 text-right font-semibold tabular-nums text-indigo-700 sm:w-12">{h.hymnNumber}</span>
                  <span className="min-w-0">{h.title}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => dispatch(favoriteToggled(h.hymnNumber))}
                  aria-pressed={fav}
                  aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neu-base shadow-neu-btn transition-all duration-150 active:shadow-neu-pressed"
                  style={{ color: fav ? 'var(--fav)' : 'var(--muted)' }}
                >
                  <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
