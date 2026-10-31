import {
  COLORS,
  DEFAULT_BPM,
  DEFAULT_KEYBINDING,
  DEFAULT_KEYBINDING_MODE,
  DEFAULT_METRONOME_TIME_SIGNATURE,
  DEFAULT_TRACK_VOLUME,
  TOP_ROW_KEYS
} from '../../../constants';
import { AudioTrack, TonalPadKey } from '../types';

export const getRandomColor = () => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

export const getFileNameWithoutExtension = (filePath: string): string => {
  const fileName = filePath.split(/[/\\]/).pop() || '';
  return fileName.replace(/\.mp3$/i, '');
};

export const createTrack = (name: string, source: AudioTrack['source']): AudioTrack => ({
  id: crypto.randomUUID(),
  name,
  source,
  keybinding: DEFAULT_KEYBINDING,
  keybindingMode: DEFAULT_KEYBINDING_MODE,
  color: getRandomColor(),
  volume: DEFAULT_TRACK_VOLUME,
  bpm: DEFAULT_BPM,
  timeSignature: DEFAULT_METRONOME_TIME_SIGNATURE
});

export const createTrackFromPath = (path: string): AudioTrack =>
  createTrack(getFileNameWithoutExtension(path), { type: 'file', path });

export const createTonalTrack = (key: TonalPadKey): AudioTrack =>
  createTrack(key, { type: 'tonal', key });

export const syncPositionBasedKeybindings = (tracks: AudioTrack[]): AudioTrack[] => {
  const customKeys = new Set(
    tracks
      .filter(
        (track) => track.keybindingMode === 'custom' && track.keybinding !== DEFAULT_KEYBINDING
      )
      .map((track) => track.keybinding)
  );

  return tracks.map((track, index) => {
    if (track.keybindingMode === 'custom') return track;

    const positionKey = TOP_ROW_KEYS[index] ?? DEFAULT_KEYBINDING;
    return {
      ...track,
      keybinding: positionKey && !customKeys.has(positionKey) ? positionKey : DEFAULT_KEYBINDING
    };
  });
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

export const moveTrackToEndById = (tracks: AudioTrack[], trackId: string): AudioTrack[] => {
  const sourceIndex = tracks.findIndex((track) => track.id === trackId);

  if (sourceIndex === -1 || sourceIndex === tracks.length - 1) {
    return tracks;
  }

  const reorderedTracks = [...tracks];
  const [track] = reorderedTracks.splice(sourceIndex, 1);

  reorderedTracks.push(track);
  return reorderedTracks;
};
