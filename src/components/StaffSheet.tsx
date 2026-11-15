import { useEffect, useRef } from 'react';
import * as VF from 'vexflow';
import {
  Accidental, Barline, Dot, Formatter, Renderer, Stave, StaveConnector, StaveNote, Voice,
} from 'vexflow';
import type { Hymn, HymnMeasure, HymnNote, Part } from '../types/hymn';
import { useElementWidth } from '../hooks/useElementWidth';
import { BP_LANDSCAPE, BP_PORTRAIT, balance, measuresPerLine } from '../lib/layout';
import { SheetHeader } from './SheetHeader';
import { Verses } from './Verses';

const LEFT_PAD = 30;
const RIGHT_PAD = 6;
const MIN_MEASURE_WIDTH = 150;
const FIRST_MEASURE_EXTRA = 70;   
const TIME_SIG_EXTRA = 28;       
const TREBLE_Y = 34;
const BASS_Y = 130;
const SYSTEM_HEIGHT = 240;

/**
 * Phones draw the score on a fixed logical canvas and let the SVG scale down to the screen,
 * so 4 measures (portrait) or 6 (landscape) per system stay legible without horizontal scrolling.
 */
function staffLayout(width: number, total: number, usableAt: (w: number) => number) {
  if (width < BP_PORTRAIT) return { logical: 470, perSystem: balance(total, 4) };
  if (width < BP_LANDSCAPE) return { logical: Math.max(760, width), perSystem: balance(total, 6) };
  return { logical: width, perSystem: measuresPerLine(usableAt(width), MIN_MEASURE_WIDTH, total, FIRST_MEASURE_EXTRA) };
}

function fontsReady(): Promise<unknown> {
  const vf = (VF as unknown as { VexFlow?: { loadFonts?: (...n: string[]) => Promise<unknown>; setFonts?: (...n: string[]) => void } }).VexFlow;
  if (!vf?.loadFonts) return Promise.resolve();
  return vf.loadFonts('Bravura', 'Academico').then(() => vf.setFonts?.('Bravura', 'Academico')).catch(() => undefined);
}

const KEY_NAMES: Record<string, string> = { C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', B: 'B' };

const PITCHES = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'];

function vexKey(midi: number): string {
  return `${PITCHES[midi % 12]}/${Math.floor(midi / 12) - 1}`;
}

function vexDuration(beats: number): { duration: string; dots: number } | null {
  const table: Record<string, { duration: string; dots: number }> = {
    '4': { duration: 'w', dots: 0 },
    '3': { duration: 'h', dots: 1 },
    '2': { duration: 'h', dots: 0 },
    '1.5': { duration: 'q', dots: 1 },
    '1': { duration: 'q', dots: 0 },
    '0.5': { duration: '8', dots: 0 },
    '0.25': { duration: '16', dots: 0 },
  };
  return table[String(beats)] ?? null;
}

function buildNotes(notes: HymnNote[], clef: 'treble' | 'bass', stemUp: boolean, measureStart: number): StaveNote[] {
  const out: StaveNote[] = [];
  const restKey = clef === 'treble' ? 'b/4' : 'd/3';
  let cursor = measureStart;

  const push = (key: string, beats: number, isRest: boolean) => {
    const d = vexDuration(beats);
    if (!d) return;
    const note = new StaveNote({
      clef,
      keys: [isRest ? restKey : key],
      duration: isRest ? `${d.duration}r` : d.duration,
    });
    if (!isRest) note.setStemDirection(stemUp ? 1 : -1);
    if (d.dots) Dot.buildAndAttach([note], { all: true });
    out.push(note);
  };

  const sorted = notes
    .filter(n => n.midi != null && n.startBeat != null && n.durationBeats != null)
    .sort((a, b) => a.startBeat! - b.startBeat!);

  for (const n of sorted) {
    if (n.startBeat! > cursor) push('', n.startBeat! - cursor, true); // fill gaps with rests
    push(vexKey(n.midi!), n.durationBeats!, false);
    cursor = n.startBeat! + n.durationBeats!;
  }
  return out;
}

function makeVoice(notes: StaveNote[], beats: number): Voice {
  const voice = new Voice({ numBeats: beats, beatValue: 4 }).setStrict(false);
  voice.addTickables(notes);
  return voice;
}

export function StaffSheet({ hymn }: { hymn: Hymn }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(wrapRef);

  useEffect(() => {
    let cancelled = false;
    fontsReady().then(() => { if (!cancelled) draw(); });
    return () => { cancelled = true; };

    function draw() {
    const container = drawRef.current;
    if (!container) return;
    container.innerHTML = '';

    const total = hymn.measures.length;
    const keySig = KEY_NAMES[hymn.key?.do] ?? 'C';
    const [beatsPerBar, beatValue] = (hymn.meter ?? '4/4').split('/').map(Number);

    const { logical, perSystem } = staffLayout(width, total, w => w - LEFT_PAD - RIGHT_PAD);
    const drawWidth = Math.max(260, logical);
    const usable = drawWidth - LEFT_PAD - RIGHT_PAD;
    const systems: HymnMeasure[][] = [];
    for (let i = 0; i < total; i += perSystem) systems.push(hymn.measures.slice(i, i + perSystem));

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(drawWidth, systems.length * SYSTEM_HEIGHT + 20);
    const context = renderer.getContext();
    const svg = container.querySelector('svg');
    if (svg) {
      if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${drawWidth} ${systems.length * SYSTEM_HEIGHT + 20}`);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.height = 'auto';
    }

    systems.forEach((measures, sysIndex) => {
      const topY = TREBLE_Y + sysIndex * SYSTEM_HEIGHT;
      const bassY = BASS_Y + sysIndex * SYSTEM_HEIGHT;
      const extraFirst = FIRST_MEASURE_EXTRA + (sysIndex === 0 ? TIME_SIG_EXTRA : 0);
      const base = (usable - extraFirst) / measures.length;
      let x = LEFT_PAD;

      measures.forEach((measure, mi) => {
        const isFirst = mi === 0;
        const isLastOfPiece = measure.number === hymn.measures[total - 1].number;
        const w = isFirst ? base + extraFirst : base;

        const treble = new Stave(x, topY, w);
        const bass = new Stave(x, bassY, w);

        if (isFirst) {
          treble.addClef('treble').addKeySignature(keySig);
          bass.addClef('bass').addKeySignature(keySig);
          if (sysIndex === 0) {
            treble.addTimeSignature(`${beatsPerBar}/${beatValue}`);
            bass.addTimeSignature(`${beatsPerBar}/${beatValue}`);
          }
        }
        if (isLastOfPiece) {
          treble.setEndBarType(Barline.type.END);
          bass.setEndBarType(Barline.type.END);
        }
        treble.setContext(context).draw();
        bass.setContext(context).draw();

        const join = (type: Parameters<StaveConnector["setType"]>[0]) =>
          new StaveConnector(treble, bass).setType(type).setContext(context).draw();
        join(StaveConnector.type.SINGLE_LEFT);
        if (isFirst) join(StaveConnector.type.BRACE);
        if (isLastOfPiece) join(StaveConnector.type.BOLD_DOUBLE_RIGHT);
        else if (mi === measures.length - 1) join(StaveConnector.type.SINGLE_RIGHT);

        context.save();
        context.setFont('Arial', 10, 'normal');
        context.fillText(String(measure.number), x + (isFirst ? extraFirst - 8 : 6), topY + 4);
        context.setFont('serif', 15, 'bold italic');
        if (measure.segno) context.fillText('§', x + 4, topY - 12);
        if (measure.dalSegno) context.fillText('D. S.', x + w - 38, topY - 12);
        context.restore();

        const measureStart = (measure.number - 1) * beatsPerBar;
        const trebleVoices = [
          makeVoice(buildNotes(measure.voices.soprano.notes, 'treble', true, measureStart), beatsPerBar),
          makeVoice(buildNotes(measure.voices.alto.notes, 'treble', false, measureStart), beatsPerBar),
        ];
        const bassVoices = [
          makeVoice(buildNotes(measure.voices.tenor.notes, 'bass', true, measureStart), beatsPerBar),
          makeVoice(buildNotes(measure.voices.bass.notes, 'bass', false, measureStart), beatsPerBar),
        ];

        Accidental.applyAccidentals(trebleVoices, keySig);
        Accidental.applyAccidentals(bassVoices, keySig);

        const noteAreaWidth = Math.max(40, treble.getNoteEndX() - treble.getNoteStartX() - 12);
        new Formatter().joinVoices([trebleVoices[0]]).joinVoices([trebleVoices[1]])
          .format(trebleVoices, noteAreaWidth);
        new Formatter().joinVoices([bassVoices[0]]).joinVoices([bassVoices[1]])
          .format(bassVoices, noteAreaWidth);

        trebleVoices.forEach(v => v.draw(context, treble));
        bassVoices.forEach(v => v.draw(context, bass));

        x += w;
      });
    });
    }
  }, [hymn, width]);

  return (
    <section className="sheet !border-0 !bg-neu-base !text-slate-800 !shadow-neu-flat !rounded-2xl p-1.5 sm:p-6 overflow-x-auto">
      <SheetHeader hymn={hymn} leftText={`Do = ${hymn.key.do}`} className="mb-2 sm:mb-4" />
      <div ref={wrapRef} className="w-full">
        <div ref={drawRef} className="staff-draw" aria-label="Piano score: soprano and alto on the treble staff, tenor and bass on the bass staff" />
      </div>
      <Verses hymn={hymn} />
    </section>
  );
}
export type { Part };
