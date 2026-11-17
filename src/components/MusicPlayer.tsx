import { useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  MAX_BPM, MIN_BPM, bpmChanged, partToggled, selectBpm, selectEnabledParts, selectPlaying,
  startPlayback, stopPlayback,
} from '../features/player/playerSlice';
import { btnPrimary, chip } from '../lib/ui';
import { PARTS, type Hymn } from '../types/hymn';

export function MusicPlayer({ hymn }: { hymn: Hymn }) {
  const dispatch = useAppDispatch();
  const bpm = useAppSelector(selectBpm);
  const enabled = useAppSelector(selectEnabledParts);
  const playing = useAppSelector(selectPlaying);

  useEffect(() => () => { dispatch(stopPlayback()); }, [dispatch]);

  return (
    <>
      <button
        type="button"
        className={`${btnPrimary} btn-icon sm:w-auto !border-0 !bg-neu-base !text-slate-800 !shadow-neu-btn active:!shadow-neu-pressed !rounded-xl transition-all duration-150 focus-visible:!outline-none focus-visible:!shadow-neu-pressed`}
        onClick={() => dispatch(playing ? stopPlayback() : startPlayback(hymn))}
        disabled={!playing && enabled.length === 0}
        aria-label={playing ? 'Stop' : 'Play'}
      >
        {playing ? <Square size={15} /> : <Play size={15} />}
      </button>

      <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Voices to play">
        {PARTS.filter(part => !hymn.parts?.length || hymn.parts.includes(part)).map(part => (
          <button
            key={part}
            type="button"
            aria-pressed={enabled.includes(part)}
            aria-label={part}
            title={part}
            className={`${chip(enabled.includes(part))} !border-0 !bg-neu-base !text-slate-700 !rounded-xl transition-all duration-150 active:!shadow-neu-pressed ${enabled.includes(part) ? "!shadow-neu-pressed-sm" : "!shadow-neu-btn"}`}
            onClick={() => dispatch(partToggled(part))}
          >
            <span className="sm:hidden">{part[0].toUpperCase()}</span>
            <span className="hidden sm:inline">{part}</span>
          </button>
        ))}
      </div>

      <label className="tempo !border-0 !bg-neu-base !text-slate-700 !shadow-neu-pressed-sm !rounded-xl">
        <span className="hidden shrink-0 sm:inline">Tempo</span>
        <input
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={e => dispatch(bpmChanged(Number(e.target.value)))}
          disabled={playing}
          aria-label="Tempo (BPM)"
        />
        <strong>{bpm}<span className="hidden sm:inline"> BPM</span></strong>
      </label>
    </>
  );
}
