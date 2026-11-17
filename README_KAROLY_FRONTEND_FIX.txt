ANGLICAN HYMNBOOK — RESPONSIVE HOMEPAGE + FLEXIBLE METER REPAIR
Date: 17 November 2026
Based strictly on the user-uploaded src.zip.

WHAT CHANGED
- HomePage.tsx: max-w-3xl -> max-w-6xl (same width as HymnPage).
- index.css: match the outer html/body/#root background to the neumorphic main page background (#e0e5ec); make all edges the same colour in the light theme.
- SolfaSheet.tsx: display all colon-delimited sol-fa cells, not just two. Number of visual cells is read per measure. Supports 3/4-like three-cell measures and differing cell counts. Handles missing voices in 3-part hymns and labels meter changes.
- StaffSheet.tsx: use 2/4, 3/4, 4/4, 2/2, 6/8 from JSON, including optional measure.meter changes and pickup measures. Correct timing offsets. Add 4/3-beat three-note group as VexFlow half-note triplets (3 in the time of 2). Unsupported durations log a warning instead of silently dropping all notes.
- timing.ts (NEW): common conversion of JSON meter, pickup, absolute/measure-relative note starts. Use quarter-note units internally, then convert to BPM via playback.beatUnit when provided.
- music.ts: playback and MIDI export share the same normalized note sequence.
- playback.ts: use the same normalized quarter-note timing for audio.
- playerSlice.ts: log playback-start errors instead of failing silently.
- MusicPlayer.tsx: don't show voice buttons for voices absent from a trio's data.
- SheetHeader.tsx: prevent duplicate title/composer punctuation.
- types/hymn.ts: optional per-measure meter/pickup, optional actual parts, optional timing base/tempo beat unit.

UNCHANGED
- All hymn *.json files are unchanged. Transcription inaccuracies in JSON must still be checked separately against the original scans.
- Existing neumorphic UI design, toolbar and controls are retained.

HOW TO INSTALL
1. Back up your src folder.
2. Unzip the PATCH ZIP at the project ROOT, preserving its src/... folder structure, overwriting only those named files. Alternatively, unzip src_fixed.zip at the project root to replace the entire src folder.
3. In your normal project (where node_modules is installed):
   npm run build
   npm run dev
4. Open the homepage and a hymn; check that both have the same horizontal width and that the body margins have the same background colour.
5. Check hymn 003 (3/4, with a 1-beat pickup), hymn 009 (4/4), hymn 012 (three voices), and other hymns.
6. Check playback after clicking Play. Browser audio may require an explicit user interaction.

FUTURE JSON FORMAT
hymn.meter = '2/4', '3/4', '4/4', '2/2', etc.
measure.meter = '2/4' (optional: starts a meter change at that bar)
measure.pickup = true and measure.pickupBeats = 1 (optional: length expressed in quarter-note units)
hymn.noteTimeBase = 'absolute' | 'measure' (optional; otherwise inferred from data)
hymn.playback.beatUnit = 2 | 4 | 8 (optional; default quarter-note BPM)

VALIDATION DONE HERE
- All changed .ts and .tsx files pass TypeScript transpilation/syntax checks.
- All 10 supplied JSON files passed a normalized-timeline event count and range check, without any note event being lost.
- A synthetic meter-change test passed for 3/4 -> 2/4 -> 4/4 -> 2/2.
- VexFlow 5 TupletOptions checked for the numNotes/notesOccupied option names.

NOT VERIFIED HERE
- Full Vite + TypeScript production build: dependency install could not be completed in this container.
- Browser audio, real layout and staff SVG rendering: must be tested in your local app.
- Exact pitches / rhythms in existing JSONs: not re-transcribed.
