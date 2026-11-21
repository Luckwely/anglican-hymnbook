KAROLY — AUTOMATIC NOTE EVENT REPAIR
=====================================

Source: the user-supplied Karoly.zip (16 JSON hymns).
All displayRaw values are preserved EXACTLY (including formatting and punctuation).
The two differing raw values were aligned to displayRaw, never the other way around.
All note arrays were regenerated to match displayRaw sol-fa in reading order.
Each : and | is a rhythmic cell boundary; | is an internal 4/4 divider where written.
Dotted rhythms, octave marks, altered degrees, holds and pickups were interpreted.
Notes that carry across barlines need the patched src/lib/music.ts.
keyChanges in Karoly 001 are now also shown in the staff view.
The source beats for 008 playback.beatUnit were changed from invalid "quarter" to 4.
MIDI pitch classes follow do, the sol-fa degree and octave mark.

IMPORTANT: This is a notation-driven RECONSTRUCTION, not a score-verified transcription.
Absolute MIDI registers are inferred from the previous notes and may need manual correction.
Where original meters/BPM were assumed, those remain assumptions.
No audio audition or complete Vite build could be performed in this environment.

INSTALL:
1. Back up your project.
2. Extract this ZIP at the project root, preserving src/...
3. Run npm run build and npm run dev.
4. Test hymns 006, 008, 013, 027 in Sol-Fa, Staff and Play.
5. The bonus 027_verse4_preview.json must NOT be placed in src/data/hymns/karoly/
   alongside 027.json, since both share hymn number 27.

The midi/*.mid files provide an independent playback test outside the app.
The separate verse-4 MIDI is in extras/027_verse4.mid.

VALIDATION SUMMARY:
001  JSON notes  222 ->  222;  playable main events  222; meter inferred from existing data; sections: main
002  JSON notes  381 ->  377;  playable main events  377; meter inferred from existing data; sections: main
003  JSON notes  179 ->  179;  playable main events  179; meter inferred from existing data; sections: main
004  JSON notes  233 ->  233;  playable main events  233; meter inferred from existing data; sections: main
005  JSON notes  213 ->  213;  playable main events  213; meter inferred from existing data; sections: main
006  JSON notes  103 ->  175;  playable main events  175; meter inferred from existing data; sections: main
007  JSON notes  349 ->  349;  playable main events  349; meter inferred from existing data; sections: main
008  JSON notes  176 ->  176;  playable main events  176; meter inferred from existing data; sections: main
009  JSON notes  173 ->  173;  playable main events  173; meter inferred from existing data; sections: main
011  JSON notes  259 ->  259;  playable main events  259; meter inferred from existing data; sections: main
012  JSON notes  138 ->  139;  playable main events  139; meter inferred from existing data; sections: main
013  JSON notes  171 ->  339;  playable main events  339; meter inferred from existing data; sections: main
014  JSON notes  292 ->  289;  playable main events  289; meter inferred from existing data; sections: main
022  JSON notes  181 ->  181;  playable main events  181; meter inferred from existing data; sections: main
026  JSON notes  216 ->  225;  playable main events  225; meter inferred from existing data; sections: main
027  JSON notes  738 ->  738;  playable main events  356; meter inferred from existing data; sections: main, alternative_1

Notes: `displayRaw` is the preserved source of truth; `raw` now matches it.
Time starts are ABSOLUTE using original full-bar positions; the app timing module handles pickups.
A `.mid` is for testing the newly generated timing/pitches, not proof of musical accuracy.

DECLARED MEASURE COUNT MISMATCHES IN ORIGINAL UPLOAD (metadata only):
004: 32 declared vs 17 actual entries; metadata aligned to existing entries.
006: 23 declared vs 12 actual entries; metadata aligned to existing entries.
013: 48 declared vs 24 actual entries; metadata aligned to existing entries.
026: 19 declared vs 17 actual entries; metadata aligned to existing entries.
No missing measures have been invented or automatically transcribed from photographs.
A different number of grouped 4/4 measures vs older 2-cell entries does not necessarily mean missing music.
Manual inspection of score images remains necessary to verify meter, octave registers and subdivision weights.
