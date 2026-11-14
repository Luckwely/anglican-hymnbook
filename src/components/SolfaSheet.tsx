import type { Hymn, Part } from '../types/hymn';
import { PARTS } from '../types/hymn';

const labels: Record<Part, string> = {
  soprano: 'S',
  alto: 'A',
  tenor: 'T',
  bass: 'B'
};

export function SolfaSheet({ hymn }: { hymn: Hymn }) {
  const groups = [
    hymn.measures.slice(0, 8),
    hymn.measures.slice(8, 16)
  ];

  return <section
    className="sheet 
              rounded-xl 
              p-4 
              sm:p-7 
              overflow-x-auto"
  >
    <div
      className="text-center 
                  mb-6"
    >
      <h2
        className="text-xl 
                    sm:text-2xl 
                    font-bold 
                    solfa-text"
      >
        {hymn.hymnNumber}. {hymn.title}
      </h2>
      <div className="flex 
                      justify-between
                      text-sm 
                      italic 
                      mt-2"
      >
        <span>
          {hymn.sourceKeyText}
        </span>
        <span>
          {hymn.attribution}
        </span>
      </div>
    </div>
    {groups.map((group, index) =>

      <div
        key={index}
        className="mb-7 
                  overflow-x-auto">
        <div className="min-w-[950px] 
                        grid 
                        gap-0"
          style={{ gridTemplateColumns: `32px repeat(${group.length}, minmax(100px,1fr))` }}
        >
          {PARTS.map((part, partIndex) =>
            <div key={part} className="contents">
              <div className={`font-semibold 
                          text-xs 
                          py-2 
                          border-l-2 
                          border-neutral-700 
                          pl-1 
                          ${partIndex === 0 ? 'border-t' : ''}`}
              >
                {labels[part]}
              </div>
              {group.map(measure =>
                <div
                  key={`${part}-${measure.number}`}
                  className={`border-r 
                            border-neutral-700 
                            px-1 
                            py-2 
                            text-center 
                            solfa-text 
                            text-[15px] 
                            whitespace-nowrap 
                            ${partIndex === 0 ? 'border-t' : ''}`}
                  title={`Measure ${measure.number}`}
                >
                  {measure.voices[part].displayRaw || measure.voices[part].raw || '—'}
                </div>)}
            </div>)}
        </div>
        <div className="text-xs 
                        text-neutral-500 
                        mt-2"
        >
          Measures {group[0]?.number}–{group[group.length - 1]?.number} · Original punctuation retained
        </div>
      </div>)}

    <div className="grid 
                    sm:grid-cols-2 
                    gap-8 
                    solfa-text 
                    text-base 
                    leading-relaxed"
    >
      {hymn.verses.map((verse, index) =>
        <div key={index}>
          <strong>{index + 1}.</strong>
          <pre className="whitespace-pre-wrap font-inherit inline">{formatVerse(verse)}</pre>
        </div>
      )}
    </div>
    <p className="text-xs 
                  text-amber-700 
                  mt-5"
    >
      Draft: the raw Solfa is transcribed from the scan; musical interpretation and exact lyric-to-note alignment require verification.
    </p>
  </section>;
}

function formatVerse(verse: unknown): string {
  if (typeof verse === 'string') return verse;
  if (verse && typeof verse === 'object') {
    const v = verse as { lines?: string[]; text?: string };
    return v.lines?.join('\n') || v.text || JSON.stringify(verse);
  }
  return '';
}
