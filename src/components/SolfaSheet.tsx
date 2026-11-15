import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import type { Hymn, HymnMeasure, HymnVoice } from '../types/hymn';
import { PARTS } from '../types/hymn';
import { useElementWidth } from '../hooks/useElementWidth';
import { BP_LANDSCAPE, BP_PORTRAIT, balance, measuresPerLine } from '../lib/layout';
import { SheetHeader } from './SheetHeader';
import { Verses } from './Verses';

const MIN_MEASURE_WIDTH = 150; // desktop only
const AVG_CHAR_EM = 0.56;      // average glyph width used to size the text to the measure
const MEASURE_PAD_EM = 0.36;   // left+right padding of a measure (see .sf-measure)

/** Phone portrait: 4 measures per row. Phone landscape / small tablet: 6. Desktop: as many as fit. */
function layoutFor(width: number, total: number) {
  if (width < BP_PORTRAIT) return { perLine: balance(total, 4), brace: 12 };
  if (width < BP_LANDSCAPE) return { perLine: balance(total, 6), brace: 16 };
  return { perLine: measuresPerLine(width - 22, MIN_MEASURE_WIDTH, total), brace: 22 };
}

/** Longest half-measure (in characters) so the font can shrink until every cell fits. */
function longestHalf(hymn: Hymn): number {
  let max = 4;
  for (const m of hymn.measures) {
    for (const part of PARTS) {
      const v = m.voices[part];
      const [a = '', b = ''] = (v.displayRaw || v.raw || '').split(':');
      max = Math.max(max, a.trim().length, b.trim().length + 1);
    }
  }
  return max;
}

function Syllable({ token }: { token: string }) {
  if (token === '—' || token === '-') return <span>—</span>;
  const m = token.match(/^([drmfslt][aeio]?)(['₁₂]*)$/i);
  if (!m) return <span>{token}</span>;
  const [, base, marks] = m;
  return (
    <span className="sf-note">
      {base}
      {marks.includes("'") && <sup className="sf-oct">1</sup>}
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

function VoiceCells({ voice, row }: { voice: HymnVoice; row: number }) {
  const [first = '', second = ''] = (voice.displayRaw || voice.raw || '').split(':');
  const under = voice.underlineBeats ?? [];
  const style = (col: number): CSSProperties => ({ gridRow: row, gridColumn: col });
  return (
    <>
      <div className="sf-cell" style={style(1)}><Pulse text={first} underlined={under.includes(0)} /></div>
      <div className="sf-cell" style={style(2)}>
        <span className="sf-colon">:</span>
        <Pulse text={second} underlined={under.includes(1)} />
      </div>
    </>
  );
}

function Measure({ measure, isLastInLine }: { measure: HymnMeasure; isLastInLine: boolean }) {
  return (
    <div className={`sf-measure ${isLastInLine ? 'sf-measure-last' : ''}`} title={`Measure ${measure.number}`}>
      {PARTS.map((part, i) => (
        <VoiceCells key={part} voice={measure.voices[part]} row={i + 1} />
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

  const { perLine, brace: BRACE_WIDTH } = layoutFor(width, hymn.measures.length);
  const halfChars = useMemo(() => longestHalf(hymn), [hymn]);
  const measureWidth = (width - BRACE_WIDTH) / perLine;
  const fit = measureWidth / (2 * halfChars * AVG_CHAR_EM + MEASURE_PAD_EM);
  const fontSize = Math.round(Math.max(9, Math.min(18, fit)) * 10) / 10;
  const lines: HymnMeasure[][] = [];
  for (let i = 0; i < hymn.measures.length; i += perLine) lines.push(hymn.measures.slice(i, i + perLine));

  return (
    <section className="sheet !border-0 !bg-neu-base !text-slate-800 !shadow-neu-flat !rounded-2xl p-1.5 sm:p-7">
      <SheetHeader hymn={hymn} leftText={`${hymn.sourceKeyText}.`} />

      <div ref={containerRef} className="solfa-sheet w-full" style={{ fontSize }}>
        {lines.map((line, li) => {
          const hasMarkers = line.some(m => m.segno || m.dalSegno);
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
                  {m.dalSegno && <span className="sf-ds">D. S.</span>}
                </div>
              ))}

              <Brace row={noteRow} />

              {line.map((m, i) => (
                <div key={m.number} style={{ gridRow: noteRow, gridColumn: i + 2, display: 'flex' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Measure measure={m} isLastInLine={i === line.length - 1} />
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
