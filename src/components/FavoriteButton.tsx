import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { favoriteToggled, selectFavorites } from '../features/ui/favoritesSlice';
import { btnSecondary } from '../lib/ui';

export function FavoriteButton({ number, className = '' }: { number: number; className?: string }) {
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectFavorites).includes(number);
  const label = active ? 'Remove from favourites' : 'Add to favourites';
  return (
    <button
      type="button"
      className={`${btnSecondary} btn-icon no-print !border-0 !bg-neu-base !shadow-neu-btn active:!shadow-neu-pressed !rounded-xl !text-slate-700 hover:!bg-neu-base focus-visible:!shadow-neu-pressed transition-all duration-150 ${active ? 'btn-fav-on !text-rose-600' : ''} ${className}`}
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => dispatch(favoriteToggled(number))}
    >
      <Heart size={16} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
