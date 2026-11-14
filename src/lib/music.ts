import { Midi } from '@tonejs/midi';
import type { Hymn, Part } from '../types/hymn';
import { PARTS } from '../types/hymn';

export type EventNote = {
  midi: number;
  startBeat: number;
  durationBeats: number;
  part: Part
};

export function getEvents(hymn: Hymn, enabled: Part[] = [...PARTS]): EventNote[] {
  return hymn.measures.flatMap(measure => enabled.flatMap(part =>
    measure.voices[part].notes.flatMap(note =>
      note.midi == null || note.startBeat == null || note.durationBeats == null ? [] :
        [{
          midi: note.midi,
          startBeat: note.startBeat,
          durationBeats: note.durationBeats, part
        }]
    )
  )).sort((a, b) => a.startBeat - b.startBeat);
}

export function createMidi(hymn: Hymn, bpm: number, enabled: Part[]): Uint8Array {
  const midi = new Midi();
  midi.header.setTempo(bpm);

  const secondsPerBeat = 60 / bpm;

  for (const part of enabled) {
    const track = midi.addTrack();
    track.name = part[0].toUpperCase() + part.slice(1);
    track.instrument.number = 0;

    for (const note of getEvents(hymn, [part])) track.addNote({
      midi: note.midi,
      time: note.startBeat * secondsPerBeat,
      duration: note.durationBeats * secondsPerBeat,
      velocity: 0.75
    });
  }
  return midi.toArray();
}

export function downloadMidi(hymn: Hymn, bpm: number, enabled: Part[]) {
  const bytes = createMidi(
    hymn,
    bpm,
    enabled
  );

  const blob = new Blob([new Uint8Array(bytes)], { type: 'audio/midi' });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${hymn.id}.mid`;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function midiToName(midi: number): string {
  const names = [
    'C',
    'C♯',
    'D',
    'E♭',
    'E',
    'F',
    'F♯',
    'G',
    'A♭',
    'A',
    'B♭',
    'B'
  ];

  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}
