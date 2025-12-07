import { DEFAULT_TRACK_VOLUME } from '../../../constants';
import { AudioTrack } from '../types';

export const createTrackFromPath = (path: string): AudioTrack => {
  // Extract filename from path
  const name = path.split(/[/\\]/).pop()?.replace('.mp3', '') || 'Unknown';

  return {
    id: crypto.randomUUID(),
    file: path,
    name,
    keybinding: null,
    color: '#4a90e2',
    volume: DEFAULT_TRACK_VOLUME
  };
};

export const validateTracks = (tracks: any[]): AudioTrack[] => {
  const validTracks = tracks.filter((t: any) => t.file && typeof t.file === 'string');
  return validTracks.map((t: any) => ({
    ...t,
    volume: t.volume ?? DEFAULT_TRACK_VOLUME
  }));
};
