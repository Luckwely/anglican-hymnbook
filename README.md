# Anglican Hymnbook — one JSON, three outputs

React + TypeScript + Vite + Tailwind demo for hymn 9, **Karoly**.

## Requirements
- Node.js 20+ and npm
- For Android builds: Android Studio and Android SDK, plus JDK configured per Capacitor documentation

## Start from scratch

```bash
# Extract this ZIP and open a terminal inside anglican-hymnbook
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Production web build

```bash
npm run build
npm run preview
```

## Android APK (Capacitor)

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio, run the project on a device or select **Build > Build Bundle(s) / APK(s) > Build APK(s)**. After changes to React or JSON, run `npm run build && npx cap sync android` again.

## Where is the single JSON?

`src/data/hymns/karoly/009.json`

The app reads it for original Tonic Sol-fa (`voices.*.raw`), staff pitches (`voices.*.notes[].midi`) and generated audio/MIDI (`midi`, `startBeat`, `durationBeats`). No `.mid` file is shipped or fetched. Clicking **Export MIDI** generates a new four-track MIDI from JSON in the browser.

## What is and is not verified

The source JSON is **karoly-009-unified-DRAFT.json** from the earlier transcription. It is not a certified transcription: octaves, rhythms, rests, measure lengths and some note readings are provisional. The staff view deliberately uses equal quarter-note visual spacing, **not** the unverified printed rhythms. The player uses provisional timing from JSON and a default 90 BPM. The original Solfa view retains transcribed symbols and punctuation but is not yet a facsimile-grade engraver; lyrics are displayed below the score, not aligned to individual notes. Verify the score before using it for performance or transcribing 500 songs.

## Adding songs later

Keep one JSON per hymn under `src/data/hymns/<category>/<number>.json`. Then implement a hymn index and a lazy loader with `import.meta.glob()`; the demo intentionally focuses on just hymn 9.

## Libraries

- `tone`: synthesized SATB playback
- `@tonejs/midi`: MIDI export
- `vexflow`: staff notation
- `tailwindcss`: responsive styling
- `@capacitor/*`: Android packaging

For offline Android operation, all JSON and JavaScript dependencies are bundled in the app. Playback uses Web Audio; audio starts after the user taps Play.
