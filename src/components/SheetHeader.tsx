import type { ReactNode } from 'react';
import type { Hymn } from '../types/hymn';

const endPunctuation = (s: string) => /[.!?…]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`;

export function SheetHeader({ hymn, leftText, className = 'mb-3 sm:mb-6' }: { hymn: Hymn; leftText: ReactNode; className?: string }) {
  return (
    <div className={`text-center text-slate-800 ${className}`}>
      <h2 className="text-base font-bold leading-tight sm:text-2xl solfa-text text-slate-800">
        {hymn.hymnNumber}. {endPunctuation(hymn.title)}
      </h2>
      <div className="mt-1 flex justify-between gap-2 text-xs italic sm:mt-2 sm:text-sm solfa-text text-slate-700">
        <span>{leftText}</span>
        <span className="text-right">{endPunctuation(hymn.attribution)}</span>
      </div>
    </div>
  );
}
