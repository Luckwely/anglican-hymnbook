import * as Tone from 'tone';
import { getEvents } from './music';
import type { Hymn, Part } from '../types/hymn';

class PlaybackEngine {
  private synths: Partial<Record<Part, Tone.PolySynth>> = {};
  private timers: number[] = [];
  private active = false;

  stop() {
    this.active = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    Object.values(this.synths).forEach(s => { s.releaseAll(); s.dispose(); });
    this.synths = {};
  }

  async start(hymn: Hymn, bpm: number, enabled: Part[], onEnd: () => void): Promise<boolean> {
    this.stop();
    if (enabled.length === 0) return false;
    await Tone.start();

    const events = getEvents(hymn, enabled);
    if (!events.length) return false;

    enabled.forEach(part => {
      this.synths[part] = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.55, release: 0.2 },
      }).toDestination();
    });

    this.active = true;
    const msPerBeat = 60000 / bpm;
    const last = Math.max(...events.map(n => n.startBeat + n.durationBeats));

    for (const n of events) {
      this.timers.push(window.setTimeout(() => {
        if (!this.active) return;
        this.synths[n.part]?.triggerAttackRelease(
          Tone.Frequency(n.midi, 'midi').toFrequency(),
          (n.durationBeats * 60 / bpm) * 0.94,
        );
      }, n.startBeat * msPerBeat));
    }
    this.timers.push(window.setTimeout(() => { this.stop(); onEnd(); }, last * msPerBeat + 400));
    return true;
  }
}

export const playbackEngine = new PlaybackEngine();
