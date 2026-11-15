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
    voices: Record<Part, HymnVoice>; 
}
export interface Hymn { 
    id: string; 
    meter?: string; 
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
            verified: boolean }; 
            verification?: unknown; 
}
