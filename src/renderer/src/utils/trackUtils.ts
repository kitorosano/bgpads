import { DEFAULT_BPM, DEFAULT_TRACK_VOLUME } from '../../../constants';
import { AudioTrack } from '../types';

// Basic color palette for random selection
const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e' // rose
];

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
    bpm: DEFAULT_BPM
  };
};

export const validateTracks = (tracks: any[]): AudioTrack[] => {
  const validTracks = tracks.filter((t: any) => t.file && typeof t.file === 'string');
  return validTracks.map((t: any) => ({
    ...t,
    volume: t.volume ?? DEFAULT_TRACK_VOLUME
  }));
};
