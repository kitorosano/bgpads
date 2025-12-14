import {
  COLORS,
  DEFAULT_BPM,
  DEFAULT_METRONOME_TIME_SIGNATURE,
  DEFAULT_TRACK_VOLUME
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
    file: path,
    name,
    keybinding: options?.keybinding || null,
    color: options?.color || getRandomColor(),
    volume: DEFAULT_TRACK_VOLUME,
    bpm: DEFAULT_BPM,
    timeSignature: DEFAULT_METRONOME_TIME_SIGNATURE
  };
};

export const validateTracks = (tracks: any[]): AudioTrack[] => {
  const validTracks = tracks.filter((t: any) => t.file && typeof t.file === 'string');
  return validTracks.map((t: any) => ({
    ...t,
    volume: t.volume ?? DEFAULT_TRACK_VOLUME,
    bpm: t.bpm ?? DEFAULT_BPM,
    timeSignature: t.timeSignature ?? DEFAULT_METRONOME_TIME_SIGNATURE
  }));
};
