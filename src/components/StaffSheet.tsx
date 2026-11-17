import { useEffect, useRef } from 'react';
import * as VF from 'vexflow';
import {
  Accidental, Barline, Dot, Formatter, Renderer, Stave, StaveConnector,
  StaveNote, Tuplet, Voice,
} from 'vexflow';
import { PARTS, type Hymn, type Part } from '../types/hymn';
import type { EventNote } from '../lib/music';
import { getEvents } from '../lib/music';
import { measureTimings, type MeasureTiming } from '../lib/timing';
import { useElementWidth } from '../hooks/useElementWidth';
import { BP_LANDSCAPE, BP_PORTRAIT, balance, measuresPerLine } from '../lib/layout';
import { SheetHeader } from './SheetHeader';
import { Verses } from './Verses';

const LEFT_PAD = 30;
const RIGHT_PAD = 6;
const MIN_MEASURE_WIDTH = 160;
const FIRST_MEASURE_EXTRA = 70;
const TIME_SIG_EXTRA = 34;
const TREBLE_Y = 34;
const BASS_Y = 130;
const SYSTEM_HEIGHT = 240;
const EPS = 0.025;

function staffLayout(width: number, total: number, usableAt: (w: number) => number) {
  if (width < BP_PORTRAIT) return { logical: 510, perSystem: balance(total, 3) };
  if (width < BP_LANDSCAPE) return { logical: Math.max(780, width), perSystem: balance(total, 4) };
  return { logical: width, perSystem: measuresPerLine(usableAt(width), MIN_MEASURE_WIDTH, total, FIRST_MEASURE_EXTRA) };
}

function fontsReady(): Promise<unknown> {
  const vf = (VF as unknown as {
    VexFlow?: { loadFonts?: (...n: string[]) => Promise<unknown>; setFonts?: (...n: string[]) => void }
  }).VexFlow;
  if (!vf?.loadFonts) return Promise.resolve();
  return vf.loadFonts('Bravura', 'Academico')
    .then(() => vf.setFonts?.('Bravura', 'Academico')).catch(() => undefined);
}

const PITCHES = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'];
function vexKey(midi: number): string {
  return `${PITCHES[midi % 12]}/${Math.floor(midi / 12) - 1}`;
}

/** Accepted regular rhythmic values, expressed in quarter-note units. */
const DURATIONS = [
  { value: 4, vf: 'w', dots: 0 },
  { value: 3, vf: 'h', dots: 1 },
  { value: 2, vf: 'h', dots: 0 },
  { value: 1.5, vf: 'q', dots: 1 },
  { value: 1, vf: 'q', dots: 0 },
  { value: 0.75, vf: '8', dots: 1 },
  { value: 0.5, vf: '8', dots: 0 },
  { value: 0.375, vf: '16', dots: 1 },
  { value: 0.25, vf: '16', dots: 0 },
  { value: 0.125, vf: '32', dots: 0 },
] as const;

interface RenderVoice { notes: StaveNote[]; tuplets: Tuplet[] }

function buildNotes(
  events: EventNote[], part: Part, clef: 'treble' | 'bass', stemUp: boolean,
  timing: MeasureTiming,
): RenderVoice {
  const notes: StaveNote[] = [];
  const tuplets: Tuplet[] = [];
  const restKey = clef === 'treble' ? 'b/4' : 'd/3';
  const entries = events
    .filter(e => e.part === part && e.startBeat >= timing.start - EPS && e.startBeat < timing.start + timing.length - EPS)
    .map(e => ({ ...e, local: Math.max(0, e.startBeat - timing.start) }))
    .sort((a, b) => a.local - b.local);
  let cursor = 0;

  const make = (midi: number | null, vfDuration: string, dots: number): StaveNote => {
    const isRest = midi == null;
    const note = new StaveNote({
      clef, keys: [isRest ? restKey : vexKey(midi)],
      duration: isRest ? `${vfDuration}r` : vfDuration,
    });
    if (!isRest) note.setStemDirection(stemUp ? 1 : -1);
    if (dots) Dot.buildAndAttach([note], { all: true });
    notes.push(note);
    return note;
  };

  /** Decompose rests into valid notes so silence is visible rather than omitted. */
  const addRest = (beats: number) => {
    let remaining = Math.max(0, beats);
    while (remaining > EPS) {
      const candidate = DURATIONS.find(d => d.value <= remaining + EPS);
      if (!candidate) break;
      make(null, candidate.vf, candidate.dots);
      remaining = Math.max(0, remaining - candidate.value);
    }
  };

  for (let i = 0; i < entries.length;) {
    const e = entries[i];
    if (e.local > cursor + EPS) addRest(e.local - cursor);
    if (e.local < cursor - EPS) { i++; continue; } // avoid overlapping corrupted notes

    // Three half-note triplets occupying four quarter-note units.
    // Existing Karoly JSONs commonly store these as 1.333 / 1.333 / 1.333.
    const group = entries.slice(i, i + 3);
    const triplet = group.length === 3 &&
      group.every(n => Math.abs(n.durationBeats - 4 / 3) < 0.02) &&
      Math.abs(group[1].local - (group[0].local + group[0].durationBeats)) < 0.03 &&
      Math.abs(group[2].local - (group[1].local + group[1].durationBeats)) < 0.03 &&
      group[0].local + 4 <= timing.length + EPS;
    if (triplet) {
      const items = group.map(n => make(n.midi, 'h', 0));
      tuplets.push(new Tuplet(items, { numNotes: 3, notesOccupied: 2 }));
      cursor = group[0].local + 4;
      i += 3;
      continue;
    }

    const remaining = Math.max(0, Math.min(e.durationBeats, timing.length - e.local));
    const d = DURATIONS.find(d => Math.abs(d.value - remaining) < EPS);
    if (d) make(e.midi, d.vf, d.dots);
    else {
      // The input cannot be faithfully represented as a single ordinary note.
      // Preserve a visible note using the nearest supported value and warn for editing.
      const nearest = [...DURATIONS].sort((a, b) => Math.abs(a.value - remaining) - Math.abs(b.value - remaining))[0];
      make(e.midi, nearest.vf, nearest.dots);
      console.warn(`Karoly ${part} measure ${timing.measure.number}: unsupported duration ${remaining}`);
    }
    cursor = e.local + remaining;
    i++;
  }
  if (cursor < timing.length - EPS) addRest(timing.length - cursor);
  if (!notes.length) addRest(timing.length);
  return { notes, tuplets };
}

function makeVoice(rendered: RenderVoice, timing: MeasureTiming): Voice {
  const numBeats = timing.length * timing.meter.denominator / 4;
  const voice = new Voice({ numBeats, beatValue: timing.meter.denominator }).setStrict(false);
  voice.addTickables(rendered.notes);
  return voice;
}

function keyName(value: string | undefined): string {
  const raw = (value || 'C').replace(/♭/g, 'b').replace(/♯/g, '#');
  return /^[A-G](?:b|#)?$/.test(raw) ? raw : 'C';
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
      const timings = measureTimings(hymn);
      if (!timings.length) return;
      const allEvents = getEvents(hymn);
      const keySig = keyName(hymn.key?.do);
      const presentParts = hymn.parts?.length ? hymn.parts : PARTS.filter(part => hymn.measures.some(m => !!m.voices[part]));
      const total = timings.length;
      const { logical, perSystem } = staffLayout(width || 390, total, w => w - LEFT_PAD - RIGHT_PAD);
      const drawWidth = Math.max(260, logical);
      const usable = drawWidth - LEFT_PAD - RIGHT_PAD;
      const systems: MeasureTiming[][] = [];
      for (let i = 0; i < total; i += perSystem) systems.push(timings.slice(i, i + perSystem));

      try {
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

        systems.forEach((group, sysIndex) => {
          const topY = TREBLE_Y + sysIndex * SYSTEM_HEIGHT;
          const bassY = BASS_Y + sysIndex * SYSTEM_HEIGHT;
          const extras = group.map((t, mi) =>
            (mi === 0 ? FIRST_MEASURE_EXTRA : 0) +
            (t.index === 0 || (t.index > 0 && t.meter.text !== timings[t.index - 1].meter.text) ? TIME_SIG_EXTRA : 0)
          );
          const base = Math.max(55, (usable - extras.reduce((a, b) => a + b, 0)) / group.length);
          let x = LEFT_PAD;

          group.forEach((timing, mi) => {
            const isFirst = mi === 0;
            const isLast = timing.index === total - 1;
            const showTime = timing.index === 0 || timing.meter.text !== timings[timing.index - 1].meter.text;
            const w = base + extras[mi];
            const treble = new Stave(x, topY, w);
            const bass = new Stave(x, bassY, w);
            if (isFirst) {
              treble.addClef('treble').addKeySignature(keySig);
              bass.addClef('bass').addKeySignature(keySig);
            }
            if (showTime) {
              treble.addTimeSignature(timing.meter.text);
              bass.addTimeSignature(timing.meter.text);
            }
            if (isLast) {
              treble.setEndBarType(Barline.type.END);
              bass.setEndBarType(Barline.type.END);
            }
            treble.setContext(context).draw();
            bass.setContext(context).draw();

            const join = (type: Parameters<StaveConnector['setType']>[0]) =>
              new StaveConnector(treble, bass).setType(type).setContext(context).draw();
            join(StaveConnector.type.SINGLE_LEFT);
            if (isFirst) join(StaveConnector.type.BRACE);
            if (isLast) join(StaveConnector.type.BOLD_DOUBLE_RIGHT);
            else if (mi === group.length - 1) join(StaveConnector.type.SINGLE_RIGHT);

            context.save();
            context.setFont('Arial', 10, 'normal');
            context.fillText(String(timing.measure.number), x + (isFirst ? FIRST_MEASURE_EXTRA - 8 : 6), topY + 4);
            context.setFont('serif', 15, 'bold italic');
            if (timing.measure.segno) context.fillText('§', x + 4, topY - 12);
            if (timing.measure.dalSegno) context.fillText('D. S.', x + w - 38, topY - 12);
            context.restore();

            const soprano = buildNotes(allEvents, 'soprano', 'treble', true, timing);
            const alto = buildNotes(allEvents, 'alto', 'treble', false, timing);
            const tenor = buildNotes(allEvents, 'tenor', 'bass', true, timing);
            const bassPart = buildNotes(allEvents, 'bass', 'bass', false, timing);
            const tv = [
              ...(presentParts.includes('soprano') ? [makeVoice(soprano, timing)] : []),
              ...(presentParts.includes('alto') ? [makeVoice(alto, timing)] : []),
            ];
            const bv = [
              ...(presentParts.includes('tenor') ? [makeVoice(tenor, timing)] : []),
              ...(presentParts.includes('bass') ? [makeVoice(bassPart, timing)] : []),
            ];
            if (tv.length) Accidental.applyAccidentals(tv, keySig);
            if (bv.length) Accidental.applyAccidentals(bv, keySig);

            const noteWidth = Math.max(30, treble.getNoteEndX() - treble.getNoteStartX() - 10);
            if (tv.length) new Formatter().joinVoices(tv).format(tv, noteWidth);
            if (bv.length) new Formatter().joinVoices(bv).format(bv, noteWidth);
            tv.forEach(v => v.draw(context, treble));
            bv.forEach(v => v.draw(context, bass));
            [...soprano.tuplets, ...alto.tuplets, ...(presentParts.includes('tenor') ? tenor.tuplets : []), ...bassPart.tuplets]
              .forEach(t => t.setContext(context).draw());
            x += w;
          });
        });
      } catch (error) {
        console.error('Unable to render staff notation:', error);
        container.textContent = 'Unable to display staff notation. Please check the browser console and the hymn note data.';
      }
    }
  }, [hymn, width]);

  return (
    <section className="sheet !border-0 !bg-neu-base !text-slate-800 !shadow-neu-flat !rounded-2xl p-1.5 sm:p-6 overflow-x-auto">
      <SheetHeader hymn={hymn} leftText={`Do = ${hymn.key.do} · ${hymn.meter ?? 'Meter not specified'}`} className="mb-2 sm:mb-4" />
      <div ref={wrapRef} className="w-full">
        <div ref={drawRef} className="staff-draw" aria-label="Four-part staff notation, reading the meter in the hymn JSON" />
      </div>
      <Verses hymn={hymn} />
    </section>
  );
}
export type { Part };
