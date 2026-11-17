import { useMemo, useRef, type ReactNode } from 'react';
import type { Hymn, HymnMeasure, HymnVoice } from '../types/hymn';
import { PARTS, type Part } from '../types/hymn';
import { useElementWidth } from '../hooks/useElementWidth';
import { BP_LANDSCAPE, BP_PORTRAIT, balance } from '../lib/layout';
import { SheetHeader } from './SheetHeader';
import { Verses } from './Verses';

const MIN_MEASURE_WIDTH = 150; // desktop only
const AVG_CHAR_EM = 0.56;      // average glyph width used to size the text to the measure
const MEASURE_PAD_EM = 0.36;   // left+right padding of a measure (see .sf-measure)

/** A colon is a rhythmic cell separator, not proof that this is 2/2 time. */
function cells(voice?: HymnVoice): string[] {
  return (voice?.displayRaw ?? voice?.raw ?? '').split(':');
}

function hymnParts(hymn: Hymn): Part[] {
  const explicit = hymn.parts?.filter(part => PARTS.includes(part));
  return explicit?.length ? explicit : PARTS.filter(part => hymn.measures.some(m => !!m.voices[part]));
}

function cellCount(measure: HymnMeasure, parts: Part[]): number {
  return Math.max(1, ...parts.map(part => cells(measure.voices[part]).length));
}

/** Fit measure count to available width and the number of printed sol-fa cells. */
function layoutFor(width: number, measures: HymnMeasure[], parts: Part[]) {
  const available = width || 390;
  const maxCells = Math.max(1, ...measures.map(m => cellCount(m, parts)));
  const brace = available < BP_PORTRAIT ? 12 : available < BP_LANDSCAPE ? 16 : 22;
  const preferredWidth = available < BP_PORTRAIT
    ? (maxCells >= 3 ? 125 : 96)
    : available < BP_LANDSCAPE ? (maxCells >= 3 ? 145 : 120) : MIN_MEASURE_WIDTH;
  const cap = available < BP_PORTRAIT ? 4 : available < BP_LANDSCAPE ? 6 : 8;
  const fit = Math.max(1, Math.min(cap, Math.floor((available - brace) / preferredWidth)));
  return { perLine: balance(measures.length, fit), brace };
}

/** Width estimate accounts for every colon-separated cell and every voice. */
function widestMeasureChars(hymn: Hymn, parts: Part[]): number {
  return Math.max(4, ...hymn.measures.map(m => {
    const count = cellCount(m, parts);
    return parts.reduce((max, part) => {
      const row = cells(m.voices[part]);
      return Math.max(max, count * Math.max(2, ...row.map(c => c.trim().length + 1)));
    }, 0);
  }));
}

function Syllable({ token }: { token: string }) {
  if (token === '—' || token === '-') return <span>—</span>;
  const m = token.match(/^([drmfslt](?:i|a)?)(['¹₂₁]*)$/i);
  if (!m) return <span>{token}</span>;
  const [, base, marks] = m;
  return (
    <span className="sf-note">
      {base}
      {(marks.includes("'") || marks.includes("¹")) && <sup className="sf-oct">1</sup>}
      {marks.includes('₁') && <sub className="sf-oct">1</sub>}
      {marks.includes('₂') && <sub className="sf-oct">2</sub>}
    </span>
  );
}

function Pulse({ text, underlined }: { text: string; underlined?: boolean }) {
  const parts = text.trim().split('.');
  const content: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i > 0) content.push(<span key={`dot-${i}`} className="sf-dot">.</span>);
    content.push(<Syllable key={i} token={p.trim()} />);
  });
  return <span className={underlined ? 'sf-underline' : undefined}>{content}</span>;
}

function VoiceCells({ voice, row, count }: { voice?: HymnVoice; row: number; count: number }) {
  const rawCells = cells(voice);
  const under = voice.underlineBeats ?? [];
  return <>
    {Array.from({ length: count }, (_, col) => (
      <div className="sf-cell" key={col} style={{ gridRow: row, gridColumn: col + 1 }}>
        {col > 0 && <span className="sf-colon">:</span>}
        <Pulse text={rawCells[col] ?? ''} underlined={under.includes(col)} />
      </div>
    ))}
  </>;
}

function Measure({ measure, parts, isLastInLine }: { measure: HymnMeasure; parts: Part[]; isLastInLine: boolean }) {
  const count = cellCount(measure, parts);
  return (
    <div
      className={`sf-measure ${isLastInLine ? 'sf-measure-last' : ''}`}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${parts.length}, auto)` }}
      title={`Measure ${measure.number} — ${count} written cells`}
    >
      {parts.map((part, i) => (
        <VoiceCells key={part} voice={measure.voices[part]} row={i + 1} count={count} />
      ))}
    </div>
  );
}

function Segno() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" aria-label="Segno" className="inline-block">
      <path
        d="M14 3.5c-1-2-5-2-5.5.8-.5 3 6 3.7 5.5 7.2-.5 3-5 3-6.500 1"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      />
      <line x1="16" y1="1.5" x2="6" y2="16.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="5.5" cy="4.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="13.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function Brace({ row }: { row: number }) {
  return (
    <svg
      className="sf-brace"
      style={{ gridRow: row, gridColumn: 1 }}
      viewBox="0 0 20 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M19 1 C9 6 11 20 11 30 C11 40 9 46 1 50 C9 54 11 60 11 70 C11 80 9 94 19 99 C13 92 15 80 15 70 C15 58 12 54 6 50 C12 46 15 42 15 30 C15 20 13 8 19 1 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SolfaSheet({ hymn }: { hymn: Hymn }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(containerRef);

  const parts = useMemo(() => hymnParts(hymn), [hymn]);
  const { perLine, brace: BRACE_WIDTH } = layoutFor(width, hymn.measures, parts);
  const measureChars = useMemo(() => widestMeasureChars(hymn, parts), [hymn, parts]);
  const measureWidth = (Math.max(width, 320) - BRACE_WIDTH) / perLine;
  const fit = measureWidth / (measureChars * AVG_CHAR_EM + MEASURE_PAD_EM);
  const fontSize = Math.round(Math.max(9, Math.min(18, fit)) * 10) / 10;
  const changedMeters = new Set<number>();
  let precedingMeter = hymn.meter ?? '4/4';
  hymn.measures.forEach((measure, index) => {
    if (measure.meter && measure.meter !== precedingMeter) changedMeters.add(index);
    precedingMeter = measure.meter ?? precedingMeter;
  });
  const lines: HymnMeasure[][] = [];
  for (let i = 0; i < hymn.measures.length; i += perLine) lines.push(hymn.measures.slice(i, i + perLine));

  return (
    <section className="sheet !border-0 !bg-neu-base !text-slate-800 !shadow-neu-flat !rounded-2xl p-1.5 sm:p-7">
      <SheetHeader hymn={hymn} leftText={`${hymn.sourceKeyText} · ${hymn.meter ?? "Meter not specified"}`} />

      <div ref={containerRef} className="solfa-sheet w-full" style={{ fontSize }}>
        {lines.map((line, li) => {
          const hasMarkers = line.some((m, i) => m.segno || m.dalSegno || changedMeters.has(li * perLine + i));
          const noteRow = hasMarkers ? 2 : 1;
          return (
            <div
              key={li}
              className="sf-line"
              style={{ gridTemplateColumns: `${BRACE_WIDTH}px repeat(${line.length}, minmax(0, 1fr))` }}
            >
              {hasMarkers && line.map((m, i) => (
                <div key={`mk-${m.number}`} className="sf-marker" style={{ gridRow: 1, gridColumn: i + 2 }}>
                  {m.segno && <Segno />}
                  {changedMeters.has(li * perLine + i) && <span className="sf-ds">{m.meter}</span>}
                  {m.dalSegno && <span className="sf-ds">D. S.</span>}
                </div>
              ))}

              <Brace row={noteRow} />

              {line.map((m, i) => (
                <div key={m.number} style={{ gridRow: noteRow, gridColumn: i + 2, display: 'flex' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Measure measure={m} parts={parts} isLastInLine={i === line.length - 1} />
                  </div>
                </div>
              ))}

              {line.map((m, i) => (
                <div key={`ly-${m.number}`} className="sf-lyric" style={{ gridRow: noteRow + 1, gridColumn: i + 2 }}>
                  {m.lyrics}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <Verses hymn={hymn} />
    </section>
  );
}
