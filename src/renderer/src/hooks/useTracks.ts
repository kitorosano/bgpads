import { useCallback, useState } from 'react';
import { DEFAULT_TRACK_VOLUME } from '../../../constants';
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
          volume: DEFAULT_TRACK_VOLUME
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

  const changeFile = useCallback((trackId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const path = window.api.getPathForFile(file);
        if (path) {
          setTracks((prev) =>
            prev.map((t) =>
              t.id === trackId ? { ...t, file: path, name: file.name.replace('.mp3', '') } : t
            )
          );
        }
      }
    };
    input.click();
  }, []);

  return {
    tracks,
    setTracks,
    addFiles,
    updateTrack,
    removeTrack,
    changeFile
  };
};
