import { Midi } from '@tonejs/midi';
import type { Hymn, Part } from '../types/hymn';
import { PARTS } from '../types/hymn';
import { inferTimeBase, measureTimings, noteLocalStart, quarterSeconds } from './timing';

export type EventNote = {
  midi: number;
  startBeat: number;
  durationBeats: number;
  part: Part;
};

/** A single shared, normalized timeline for staff rendering, audio, and MIDI. */
export function getEvents(hymn: Hymn, enabled: Part[] = [...PARTS]): EventNote[] {
  const timings = measureTimings(hymn);
  const timeBase = inferTimeBase(hymn, timings);
  const result: EventNote[] = [];
  for (const timing of timings) {
    for (const part of enabled) {
      for (const note of timing.measure.voices[part]?.notes ?? []) {
        const local = noteLocalStart(note, timing, timeBase);
        if (local == null || note.midi == null || !Number.isFinite(note.midi) ||
            note.durationBeats == null || !Number.isFinite(note.durationBeats) || note.durationBeats <= 0) continue;
        if (local < -0.025 || local >= timing.length + 0.025) continue;
        const start = Math.max(0, local);
        const duration = Math.min(note.durationBeats, timing.length - start);
        if (duration <= 0) continue;
        result.push({ midi: note.midi, startBeat: timing.start + start, durationBeats: duration, part });
      }
    }
  }
  return result.sort((a, b) => a.startBeat - b.startBeat);
}

export function createMidi(hymn: Hymn, bpm: number, enabled: Part[]): Uint8Array {
  const midi = new Midi();
  const secondsPerQuarter = quarterSeconds(bpm, hymn);
  midi.header.setTempo(60 / secondsPerQuarter);
  for (const part of enabled) {
    const track = midi.addTrack();
    track.name = part[0].toUpperCase() + part.slice(1);
    track.instrument.number = 0;
    for (const note of getEvents(hymn, [part])) track.addNote({
      midi: note.midi,
      time: note.startBeat * secondsPerQuarter,
      duration: note.durationBeats * secondsPerQuarter,
      velocity: 0.75,
    });
  }
  return midi.toArray();
}

export function downloadMidi(hymn: Hymn, bpm: number, enabled: Part[]) {
  const bytes = createMidi(hymn, bpm, enabled);
  const blob = new Blob([new Uint8Array(bytes)], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${hymn.id}.mid`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function midiToName(midi: number): string {
  const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}
