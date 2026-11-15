import type { Hymn } from '../types/hymn';
import { verseLines } from '../lib/layout';

export function Verses({ hymn }: { hymn: Hymn }) {
  return (
    <div className="mt-3 grid gap-3 text-sm leading-snug solfa-text sm:mt-4 sm:grid-cols-2 sm:gap-8 sm:text-base sm:leading-relaxed text-slate-800">
      {hymn.verses.map((verse, index) => (
        <div key={index} className="flex gap-2 rounded-2xl bg-neu-base shadow-neu-flat">
          <strong>{index + 1}</strong>
          <div>
            {verseLines(verse).map((line, i) => (
              <div key={i} className={i >= 2 ? 'pl-6 sm:pl-8' : undefined}>{line}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
