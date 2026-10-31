import { useEffect } from 'react';
import { AudioTrack } from '../types';

interface UseTrackShortcutsOptions {
  tracks: AudioTrack[];
  metronomeShortcut?: string | null;
  onTrackShortcut: (track: AudioTrack) => void;
  onMetronomeShortcut: () => void;
}

export const useTrackShortcuts = ({
  tracks,
  metronomeShortcut,
  onTrackShortcut,
  onMetronomeShortcut
}: UseTrackShortcutsOptions) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toUpperCase();

      if (metronomeShortcut && key === metronomeShortcut.toUpperCase()) {
        onMetronomeShortcut();
        return;
      }

      const track = tracks.find((track) => track.keybinding?.toUpperCase() === key);
      if (track) onTrackShortcut(track);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tracks, metronomeShortcut, onTrackShortcut, onMetronomeShortcut]);
};
