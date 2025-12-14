import { useCallback, useState } from 'react';
import { DEFAULT_BPM, DEFAULT_TRACK_VOLUME } from '../../../constants';
import { AudioTrack } from '../types';

export const useTracks = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);

  const addFiles = useCallback((files: FileList) => {
    const newTracks: AudioTrack[] = [];
    Array.from(files).forEach((file) => {
      const path = window.api.getPathForFile(file);
      if (path) {
        newTracks.push({
          id: crypto.randomUUID(),
          file: path,
          name: file.name.replace('.mp3', ''),
          keybinding: null,
          color: '#4a90e2',
          volume: DEFAULT_TRACK_VOLUME,
          bpm: DEFAULT_BPM
        });
      }
    });
    setTracks((prev) => [...prev, ...newTracks]);
  }, []);

  const updateTrack = useCallback((updatedTrack: AudioTrack) => {
    setTracks((prev) => prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)));
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    tracks,
    setTracks,
    addFiles,
    updateTrack,
    removeTrack
  };
};
