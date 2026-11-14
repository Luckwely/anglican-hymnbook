import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import type { Hymn, Part } from '../types/hymn';
import { PARTS } from '../types/hymn';
import { midiToName } from '../lib/music';

function vexKey(midi: number): { key: string; accidental?: string } {
  const pitch = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'][midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  const accidental = pitch.length > 1 ? pitch.slice(1).replace('b', 'b') : undefined;
  return { key: `${pitch[0]}/${octave}`, accidental };
}
export function StaffSheet({ hymn }: { hymn: Hymn }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = '';

    const width = 980, left = 72, measureWidth = 215, systemHeight = 490;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, systemHeight * 4 + 60);

    const context = renderer.getContext();

    for (let sys = 0; sys < 4; sys++) {
      const measures = hymn.measures.slice(sys * 4, sys * 4 + 4);
      PARTS.forEach((part, voiceIndex) => {
        const y = 35 + sys * systemHeight + voiceIndex * 112;

        measures.forEach((measure, measureIndex) => {
          const x = left + measureIndex * measureWidth;
          const stave = new Stave(x, y, measureWidth);

          if (measureIndex === 0)
            stave.addClef(part === 'bass' ? 'bass' : part === 'tenor' ? 'treble' : 'treble');
          stave.setContext(context).draw();

          if (measureIndex === 0) context.fillText(part.toUpperCase(), 8, y + 26);

          if (voiceIndex === 0) context.fillText(`${measure.number}`, x + 10, y - 7);

          const pitches = measure.voices[part].notes.filter(n => n.midi != null);

          if (!pitches.length) return;

          const notes = pitches.map(n => {
            const { key, accidental } = vexKey(n.midi!);
            const note = new StaveNote({ clef: part === 'bass' ? 'bass' : 'treble', keys: [key], duration: 'q' });
            if (accidental) note.addModifier(new Accidental(accidental), 0);
            return note;
          });

          const voice = new Voice({ numBeats: notes.length, beatValue: 4 }).setStrict(false);
          voice.addTickables(notes);
          new Formatter()
            .joinVoices([voice])
            .format([voice], measureWidth - (measureIndex === 0 ? 75 : 35));

          voice.draw(context, stave);
        });
      });
    }
  }, [hymn]);

  return <section
    className="sheet 
              rounded-xl 
              p-4 
              overflow-x-auto"
  >
    <h2
      className="font-semibold 
                mb-2"
    >
      Traditional five-line notation — SATB
    </h2>
    <p
      className="text-sm 
                text-amber-700 
                mb-3"
    >
      Pitch visualization only: quarter-note spacing is illustrative. The original scan's rhythms, rests, meter, and some registers remain unverified. Do not use this draft as an authoritative performance score.
    </p>
    <div
      ref={ref}
      className="min-w-[980px]"
      aria-label="SATB music staves"
    />
    <p
      className="text-xs 
                text-neutral-500"
    >
      MIDI pitches are read from the same hymn JSON. Example first soprano note:
      {hymn.measures[0]?.voices.soprano.notes[0]?.midi != null
        ? midiToName(hymn.measures[0].voices.soprano.notes[0].midi!)
        : 'unknown'}.
    </p>
  </section>;
}
