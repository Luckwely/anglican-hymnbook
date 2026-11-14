import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Download, Play, Square } from 'lucide-react';
import { downloadMidi, getEvents } from '../lib/music';
import type { Hymn, Part } from '../types/hymn';
import { PARTS } from '../types/hymn';

export function MusicPlayer({ hymn }: { hymn: Hymn }) {
  const [bpm, setBpm] = useState(hymn.playback?.defaultTempoBpm || 90);
  const [enabled, setEnabled] = useState<Part[]>([...PARTS]);
  const [playing, setPlaying] = useState(false);
  const synths = useRef<Partial<Record<Part, Tone.PolySynth>>>({});
  const timers = useRef<number[]>([]);
  const playingRef = useRef(false);

  function stop() {
    playingRef.current = false;
    timers.current.forEach(clearTimeout); timers.current = [];
    Object.values(synths.current).forEach(s => { s.releaseAll(); s.dispose(); });
    synths.current = {}; setPlaying(false);
  }

  useEffect(() => () => {
    playingRef.current = false;
    timers.current.forEach(clearTimeout);
    Object.values(synths.current).forEach(s => s.dispose());
  }, []);

  async function play() {
    stop(); if (enabled.length === 0) return;
    await Tone.start();

    const events = getEvents(hymn, enabled);

    if (!events.length) return;
    enabled.forEach(part => synths.current[part] = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.55,
        release: 0.2
      }
    }).toDestination());

    playingRef.current = true;
    setPlaying(true);

    const msPerBeat = 60000 / bpm;
    const last = Math.max(...events.map(n => n.startBeat + n.durationBeats));

    for (const n of events) {
      const id = window.setTimeout(() => {
        if (!playingRef.current) return;
        synths.current[n.part]?.triggerAttackRelease(Tone.Frequency(n.midi, 'midi').toFrequency(), n.durationBeats * 60 / bpm * 0.94);
      }, n.startBeat * msPerBeat);
      timers.current.push(id);
    }
    timers.current.push(window.setTimeout(stop, last * msPerBeat + 400));
  }
  return <section
    className="rounded-xl 
              bg-white 
              p-4 
              sm:p-5 
              shadow-sm 
              no-print"
  >
    <h2 className="text-lg 
                  font-semibold 
                  mb-1"
    >
      Four-voice player
    </h2>
    <p className="text-xs 
                  text-amber-700 
                  mb-4"
    >
      Provisional pitches, registers and timing; 90 BPM is a test tempo. Uses the JSON only—no MIDI file is loaded.
    </p>
    <div className="flex 
                    flex-wrap 
                    gap-4 
                    mb-4"
    >
      {PARTS.map(part =>
        <label key={part}
          className="flex 
                            items-center 
                            gap-2 
                            text-sm 
                            capitalize"
        >
          <input
            type="checkbox"
            checked={enabled.includes(part)}
            onChange={e => setEnabled(prev => e.target.checked ? [...prev, part] : prev.filter(p => p !== part))} />
          {part}
        </label>)}
    </div>
    <label className="flex 
                    items-center 
                    gap-3 
                    text-sm 
                    mb-4"
    >
      Tempo
      <input 
        type="range"
        min="50"
        max="160"
        value={bpm}
        onChange={e => setBpm(Number(e.target.value))} disabled={playing} />
      <strong>
        {bpm} BPM
      </strong>
    </label>
    <div className="flex 
                    flex-wrap 
                    gap-2"
    >
      <button
        className="bg-indigo-700 
                        text-white 
                        px-4 
                        py-2 
                        rounded-lg 
                        flex 
                        gap-2 
                        items-center 
                        disabled:opacity-50"
        onClick={playing ? stop : play}
        disabled={!playing && enabled.length === 0}>{playing
          ? <><Square size={17} /> Stop</>
          : <><Play size={17} /> Play</>}
      </button>
      <button
        className="bg-neutral-100 
                        px-4 
                        py-2 
                        rounded-lg 
                        flex 
                        gap-2 
                        items-center 
                        disabled:opacity-50"
        onClick={() => downloadMidi(hymn, bpm, enabled)}
        disabled={!enabled.length}
      >
        <Download size={17} />
        Export MIDI
      </button>
    </div>
  </section>;
}
