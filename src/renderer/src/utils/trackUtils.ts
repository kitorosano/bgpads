import {
  COLORS,
  DEFAULT_BPM,
  DEFAULT_METRONOME_TIME_SIGNATURE,
  DEFAULT_TRACK_VOLUME,
  TOP_ROW_KEYS
} from '../../../constants';
import { AudioTrack } from '../types';

export const getRandomColor = () => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

export const createTrackFromPath = (
  path: string,
  options?: { color?: string; keybinding?: string | null }
): AudioTrack => {
  // Extract filename from path
  const name = path.split(/[/\\]/).pop()?.replace('.mp3', '') || 'Unknown';

  return {
    id: crypto.randomUUID(),
    source: { type: 'file', path },
    name,
    keybinding: options?.keybinding || null,
    color: options?.color || getRandomColor(),
    volume: DEFAULT_TRACK_VOLUME,
    bpm: DEFAULT_BPM,
    timeSignature: DEFAULT_METRONOME_TIME_SIGNATURE
  };
};

export const validateTracks = (tracks: AudioTrack[]): AudioTrack[] => {
  return tracks.map((track) => ({
    ...track,
    volume: track.volume ?? DEFAULT_TRACK_VOLUME,
    bpm: track.bpm ?? DEFAULT_BPM,
    timeSignature: track.timeSignature ?? DEFAULT_METRONOME_TIME_SIGNATURE
  }));
};

export const reorderTracksById = (
  tracks: AudioTrack[],
  draggedTrackId: string,
  targetTrackId: string
): AudioTrack[] => {
  const sourceIndex = tracks.findIndex((track) => track.id === draggedTrackId);
  const targetIndex = tracks.findIndex((track) => track.id === targetTrackId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return tracks;
  }

  const reorderedTracks = [...tracks];
  const [draggedTrack] = reorderedTracks.splice(sourceIndex, 1);
  reorderedTracks.splice(targetIndex, 0, draggedTrack);

  return reorderedTracks;
};

export const normalizeKeybindingsByIndex = (tracks: AudioTrack[]): AudioTrack[] => {
  return tracks.map((track, index) => ({
    ...track,
    keybinding: TOP_ROW_KEYS[index] ?? null
  }));
};
