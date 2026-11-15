import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectView, viewChanged, type SheetView } from '../features/hymns/hymnsSlice';
import { hymnOpened } from '../features/player/playerSlice';
import { FavoriteButton } from '../components/FavoriteButton';
import { MusicPlayer } from '../components/MusicPlayer';
import { SolfaSheet } from '../components/SolfaSheet';
import { StaffSheet } from '../components/StaffSheet';
import { ThemeToggle } from '../components/ThemeToggle';
import { getHymnByNumber } from '../lib/hymns';
import { routes } from '../lib/routes';
import { btnSecondary } from '../lib/ui';
import { NotFoundPage } from './NotFoundPage';

const VIEWS: { id: SheetView; label: string }[] = [
  { id: 'solfa', label: 'Sol-Fa' },
  { id: 'staff', label: 'Staff' },
];

export function HymnPage() {
  const { number } = useParams();
  const hymn = getHymnByNumber(Number(number));
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectView);

  useEffect(() => {
    if (hymn) dispatch(hymnOpened(hymn.playback?.defaultTempoBpm));
  }, [hymn, dispatch]);

  if (!hymn) return <NotFoundPage message={`Karoly ${number} was not found.`} />;

  return (
    <main className="app-main max-w-6xl min-h-dvh bg-neu-base text-slate-800">
      {/* Top bar: back · title · favourite · theme */}
      <header className="no-print mb-1.5 flex items-center gap-1.5 sm:mb-4 sm:gap-2">
        <Link to={routes.home} className={`${btnSecondary} btn-icon !rounded-xl !border-0 !bg-neu-base !text-slate-700 !shadow-neu-btn active:!shadow-neu-pressed transition-all duration-150 sm:w-auto`} aria-label="Back to list" title="Back to list">
          <ArrowLeft size={16} />
          <span className="hidden sm:inline sm:px-2">Back</span>
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-indigo-700 sm:block">Anglican Hymnbook</p>
          <h1 className="truncate text-base font-bold sm:text-3xl">Karoly - {hymn.hymnNumber}</h1>
        </div>
        <FavoriteButton number={hymn.hymnNumber} />
        <ThemeToggle />
      </header>

      {/* Controls: always one tidy row (wraps only on extremely narrow screens) */}
      <div className="no-print mb-1.5 flex flex-wrap items-center gap-1 sm:mb-4 sm:gap-2">
        <div className="seg !rounded-xl !border-0 !bg-neu-base !shadow-neu-pressed-sm [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-neu-base [&_button]:text-slate-700 [&_button]:transition-all [&_button]:duration-150 [&_button]:aria-pressed:shadow-neu-pressed [&_button]:active:shadow-neu-pressed" role="group" aria-label="Notation">
          {VIEWS.map(v => (
            <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => dispatch(viewChanged(v.id))}>
              {v.label}
            </button>
          ))}
        </div>
        <MusicPlayer hymn={hymn} />
      </div>

      {view === 'solfa' ? <SolfaSheet hymn={hymn} /> : <StaffSheet hymn={hymn} />}
    </main>
  );
}
