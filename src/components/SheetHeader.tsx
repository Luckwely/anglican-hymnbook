import type { ReactNode } from 'react';
import type { Hymn } from '../types/hymn';

export function SheetHeader({ hymn, leftText, className = 'mb-3 sm:mb-6' }: { hymn: Hymn; leftText: ReactNode; className?: string }) {
  return (
    <div className={`text-center rounded-2xl bg-neu-base text-slate-800 shadow-neu-flat ${className}`}>
      <h2 className="text-base font-bold leading-tight sm:text-2xl solfa-text text-slate-800">
        {hymn.hymnNumber}. {hymn.title}.
      </h2>
      <div className="mt-1 flex justify-between gap-2 text-xs italic sm:mt-2 sm:text-sm solfa-text text-slate-700">
        <span>{leftText}</span>
        <span className="text-right">{hymn.attribution}.</span>
      </div>
    </div>
  );
}
