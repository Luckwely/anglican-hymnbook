import { useState } from 'react';
import hymnJson from './data/hymns/karoly/009.json';
import type { Hymn } from './types/hymn';
import { SolfaSheet } from './components/SolfaSheet';
import { StaffSheet } from './components/StaffSheet';
import { MusicPlayer } from './components/MusicPlayer';

const hymn = hymnJson as Hymn;

export default function App() {

  const [view, setView] = useState<'solfa' | 'staff'>('solfa');

  return <main
    className="max-w-6xl 
              mx-auto 
              px-3 
              sm:px-6 
              py-6"
  >
    <header className="mb-6">
      <p className="uppercase 
                    text-xs 
                    tracking-widest 
                    text-indigo-700 
                    font-semibold"
      >
        Anglican Hymnbook · Karoly
      </p>
      <h1 className="text-2xl 
                    sm:text-3xl 
                    font-bold 
                    mt-1"
      >
        Hymn {hymn.hymnNumber}
      </h1>
      <p className="text-neutral-600 
                    mt-1"
      >
        One JSON → Solfa, traditional staff and SATB playback
      </p>
    </header>
    <div
      className="flex 
                gap-2 
                mb-4 
                no-print"
    >
      <button
        onClick={() => setView('solfa')}
        className={`px-4 
                    py-2 
                    rounded-lg 
                    ${view === 'solfa' ? 'bg-indigo-700 text-white' : 'bg-white'}`}
      >
        Original Solfa
      </button>
      <button
        onClick={() => setView('staff')}
        className={`px-4 
                    py-2 
                    rounded-lg 
                    ${view === 'staff' ? 'bg-indigo-700 text-white' : 'bg-white'}`}
      >
        Five-line staff
      </button>
      <button
        onClick={() => window.print()}
        className="ml-auto 
                  px-4 
                  py-2 
                  rounded-lg 
                  bg-white"
      >
        Print
      </button>
    </div>

    {view === 'solfa' ? <SolfaSheet hymn={hymn} /> : <StaffSheet hymn={hymn} />}

    <div className="mt-5">
      <MusicPlayer hymn={hymn} />
    </div>
    <footer
      className="text-xs 
                  text-neutral-500 
                  mt-5"
    >
      Prototype using an unverified transcription. Review the notes and rhythms against the original hymnbook before publication.
    </footer>
  </main>;
}
