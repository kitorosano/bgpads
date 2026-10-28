import { useCallback } from 'react';
import { DEFAULT_BPM, DEFAULT_TRACK_VOLUME } from '../../../constants';
import { AudioTrack } from '../types';
import { useAppConfig } from './useAppConfig';

export const useTracks = () => {
  const { tracks, setTracks } = useAppConfig();

  const addFiles = useCallback(
    (files: FileList) => {
      const newTracks: AudioTrack[] = [];

      Array.from(files).forEach((file) => {
        const path = window.api.getPathForFile(file);

        if (path) {
          newTracks.push({
            id: crypto.randomUUID(),
            source: { type: 'file', path },
            name: file.name.replace(/\.mp3$/i, ''),
            keybinding: null,
            color: '#4a90e2',
            volume: DEFAULT_TRACK_VOLUME,
            bpm: DEFAULT_BPM
          });
        }
      });

      if (newTracks.length === 0) return;

      setTracks((previousTracks) => [...previousTracks, ...newTracks]);
    },
    [setTracks]
  );

  const updateTrack = useCallback(
    (updatedTrack: AudioTrack) => {
      setTracks((previousTracks) =>
        previousTracks.map((track) => (track.id === updatedTrack.id ? updatedTrack : track))
      );
    },
    [setTracks]
  );

  const removeTrack = useCallback(
    (id: string) => {
      setTracks((previousTracks) => previousTracks.filter((track) => track.id !== id));
    },
    [setTracks]
  );

  return {
    tracks,
    setTracks,
    addFiles,
    updateTrack,
    removeTrack
  };
};
