import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk, RootState } from '../../app/store';
import { playbackEngine } from '../../lib/playback';
import { PARTS, type Hymn, type Part } from '../../types/hymn';

export const DEFAULT_BPM = 90;
export const MIN_BPM = 50;
export const MAX_BPM = 160;

interface PlayerState {
  bpm: number;
  enabledParts: Part[];
  playing: boolean;
}

const initialState: PlayerState = {
  bpm: DEFAULT_BPM,
  enabledParts: [...PARTS],
  playing: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    /** Called whenever a hymn page opens: reset tempo to that hymn's default and stop sound. */
    hymnOpened(state, action: PayloadAction<number | undefined>) {
      state.bpm = action.payload || DEFAULT_BPM;
      state.playing = false;
    },
    bpmChanged(state, action: PayloadAction<number>) {
      state.bpm = Math.min(MAX_BPM, Math.max(MIN_BPM, action.payload));
    },
    partToggled(state, action: PayloadAction<Part>) {
      const p = action.payload;
      state.enabledParts = state.enabledParts.includes(p)
        ? state.enabledParts.filter(x => x !== p)
        : PARTS.filter(x => x === p || state.enabledParts.includes(x));
    },
    playbackStarted(state) { state.playing = true; },
    playbackStopped(state) { state.playing = false; },
  },
});

export const { hymnOpened, bpmChanged, partToggled, playbackStarted, playbackStopped } = playerSlice.actions;
export default playerSlice.reducer;

/* ---- thunks: side effects live here, components stay dumb ---- */
export const startPlayback = (hymn: Hymn): AppThunk => async (dispatch, getState) => {
  const { bpm, enabledParts } = getState().player;
  try {
    const started = await playbackEngine.start(hymn, bpm, enabledParts, () => dispatch(playbackStopped()));
    if (started) dispatch(playbackStarted());
    else dispatch(playbackStopped());
  } catch (error) {
    console.error('Could not start audio playback:', error);
    dispatch(playbackStopped());
  }
};

export const stopPlayback = (): AppThunk => dispatch => {
  playbackEngine.stop();
  dispatch(playbackStopped());
};

/* ---- selectors ---- */
export const selectBpm = (s: RootState) => s.player.bpm;
export const selectEnabledParts = (s: RootState) => s.player.enabledParts;
export const selectPlaying = (s: RootState) => s.player.playing;
