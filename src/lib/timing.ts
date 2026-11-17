import type { Hymn, HymnMeasure, HymnNote } from '../types/hymn';
import { PARTS } from '../types/hymn';

/** All internal positions are measured in quarter-note units. */
export interface MeterInfo {
  text: string;
  numerator: number;
  denominator: number;
  quarterBeats: number;
}

export interface MeasureTiming {
  measure: HymnMeasure;
  index: number;
  meter: MeterInfo;
  /** Position in the corrected continuous score, including pickup adjustments. */
  start: number;
  /** Where absolute note times begin in the existing JSON's full-bar timeline. */
  sourceStart: number;
  /** Actual displayed duration; may be shorter for an anacrusis. */
  length: number;
  fullLength: number;
  pickupShift: number;
}

export type TimeBase = 'absolute' | 'measure';

export function parseMeter(value: string | undefined, fallback = '4/4'): MeterInfo {
  const requested = value || fallback;
  const match = /^(\d{1,2})\s*\/\s*(1|2|4|8|16)$/.exec(requested.trim());
  if (!match) {
    if (requested === fallback) return { text: '4/4', numerator: 4, denominator: 4, quarterBeats: 4 };
    return parseMeter(fallback, '4/4');
  }
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (numerator < 1 || numerator > 32) return parseMeter(fallback, '4/4');
  return { text: `${numerator}/${denominator}`, numerator, denominator, quarterBeats: numerator * 4 / denominator };
}

/** A measure may override hymn.meter (e.g., a change from 3/4 to 2/4). */
export function measureTimings(hymn: Hymn): MeasureTiming[] {
  const result: MeasureTiming[] = [];
  let start = 0;
  let sourceStart = 0;
  let currentMeter = parseMeter(hymn.meter);
  hymn.measures.forEach((measure, index) => {
    if (measure.meter) currentMeter = parseMeter(measure.meter, currentMeter.text);
    const fullLength = currentMeter.quarterBeats;
    const rawPickup = measure.pickup ? measure.pickupBeats : undefined;
    const pickup = rawPickup != null && Number.isFinite(rawPickup) && rawPickup > 0 && rawPickup < fullLength
      ? rawPickup : undefined;
    const length = pickup ?? fullLength;
    const pickupShift = pickup == null ? 0 : fullLength - pickup;
    result.push({ measure, index, meter: currentMeter, start, sourceStart, fullLength, length, pickupShift });
    start += length;
    sourceStart += fullLength;
  });
  return result;
}

/** Determine whether the stored beat positions restart at each measure. */
export function inferTimeBase(hymn: Hymn, timings: MeasureTiming[] = measureTimings(hymn)): TimeBase {
  if (hymn.noteTimeBase) return hymn.noteTimeBase;
  let absoluteVotes = 0;
  let measureVotes = 0;
  for (const t of timings.slice(1)) {
    for (const part of PARTS) {
      for (const n of t.measure.voices[part]?.notes ?? []) {
        if (n.startBeat == null || !Number.isFinite(n.startBeat)) continue;
        const b = n.startBeat;
        if (b >= t.sourceStart - 0.02 && b < t.sourceStart + t.fullLength + 0.02) absoluteVotes++;
        if (b >= -0.02 && b < t.fullLength - 0.02) measureVotes++;
      }
    }
  }
  return absoluteVotes > measureVotes ? 'absolute' : 'measure';
}

/** Convert either stored timing convention to this measure's local quarter-note position. */
export function noteLocalStart(n: HymnNote, t: MeasureTiming, timeBase: TimeBase): number | null {
  if (n.startBeat == null || !Number.isFinite(n.startBeat)) return null;
  const sourceLocal = n.startBeat - (timeBase === 'absolute' ? t.sourceStart : 0);
  // Some pickup JSONs store notes in the final beat of a full-length first measure.
  if (t.pickupShift > 0) {
    const starts = PARTS.flatMap(part => t.measure.voices[part]?.notes ?? [])
      .map(x => x.startBeat)
      .filter((x): x is number => x != null && Number.isFinite(x))
      .map(x => x - (timeBase === 'absolute' ? t.sourceStart : 0));
    const recordedAtEnd = starts.length > 0 && Math.min(...starts) >= t.pickupShift - 0.02;
    return sourceLocal - (recordedAtEnd ? t.pickupShift : 0);
  }
  return sourceLocal;
}

export function quarterSeconds(bpm: number, hymn: Hymn): number {
  const beatUnit = hymn.playback?.beatUnit ?? 4;
  return 60 / Math.max(1, bpm) * (beatUnit / 4);
}
