export const PARTS = ['soprano', 'alto', 'tenor', 'bass'] as const;
export type Part = typeof PARTS[number];
export interface HymnNote { 
    solfa: string; 
    degree: string; 
    midi: number | null; 
    startBeat: number | null; 
    durationBeats: number | null; 
    pitchVerified?: boolean; 
    timingVerified?: boolean; 
    midiRegisterVerified?: boolean; 
}
export interface HymnVoice { 
    raw: string; 
    displayRaw?: string; 
    underlineBeats?: number[]; 
    notes: HymnNote[]; 
}
export interface HymnMeasure { 
    number: number; 
    system: number; 
    lyrics?: string; 
    segno?: boolean; 
    dalSegno?: boolean; 
    /** Optional meter change from this measure onward, e.g. 2/4 or 3/4. */
    meter?: string;
    /** Optional anacrusis (pickup) in quarter-note units. */
    pickup?: boolean;
    pickupBeats?: number;
    voices: Partial<Record<Part, HymnVoice>>; 
}
export interface Hymn { 
    id: string; 
    meter?: string; 
    /** If unspecified, the app detects whether startBeat is absolute or measure-local. */
    noteTimeBase?: 'absolute' | 'measure';
    parts?: Part[];
    title: string; 
    hymnNumber: number; 
    category: string; 
    attribution: string; 
    sourceKeyText: string; 
    key: { 
        do: string; 
        mode: string }; 
        measures: HymnMeasure[]; 
        verses: unknown[]; 
        playback?: { 
            defaultTempoBpm: number; 
            verified: boolean;
            /** Musical beat counted by BPM: 4=quarter, 2=half, 8=eighth. */
            beatUnit?: 2 | 4 | 8 }; 
            verification?: unknown; 
}
