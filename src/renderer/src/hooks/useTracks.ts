import { useCallback } from 'react';
import { TonalPadKey } from 'src/types';
import { AudioTrack } from '../types';
import {
  createTonalTrack,
  createTrackFromPath,
  getFileNameWithoutExtension,
  moveTrackToEndById,
  reorderTracksById,
  syncPositionBasedKeybindings
} from '../utils/trackUtils';
import { useAppConfig } from './useAppConfig';

export const useTracks = () => {
  const { tracks, setTracks, autoAssignPositionBasedShortcuts } = useAppConfig();

  const applyShortcutPolicy = useCallback(
    (tracks: AudioTrack[]) => {
      if (!autoAssignPositionBasedShortcuts) return tracks;
      return syncPositionBasedKeybindings(tracks);
    },
    [autoAssignPositionBasedShortcuts]
  );

  const addTracks = useCallback(
    (filePaths: string[]) => {
      setTracks((previousTracks) => {
        const newTracks = filePaths.map(createTrackFromPath);
        return applyShortcutPolicy([...previousTracks, ...newTracks]);
      });
    },
    [setTracks, applyShortcutPolicy]
  );

  const addTonalTrack = useCallback(
    (key: TonalPadKey) => {
      setTracks((previousTracks) => {
        const newTrack = createTonalTrack(key);
        return applyShortcutPolicy([...previousTracks, newTrack]);
      });
    },
    [setTracks, applyShortcutPolicy]
  );

  const reorderTracks = useCallback(
    (draggedTrackId: string, targetTrackId: string) => {
      setTracks((previousTracks) => {
        const reorderedTracks = reorderTracksById(previousTracks, draggedTrackId, targetTrackId);
        return applyShortcutPolicy(reorderedTracks);
      });
    },
    [setTracks, applyShortcutPolicy]
  );

  const moveTrackToEnd = useCallback(
    (trackId: string) => {
      setTracks((previousTracks) => {
        const reorderedTracks = moveTrackToEndById(previousTracks, trackId);
        return applyShortcutPolicy(reorderedTracks);
      });
    },
    [setTracks, applyShortcutPolicy]
  );

  const updateTrack = useCallback(
    (updatedTrack: AudioTrack) => {
      setTracks((previousTracks) =>
        previousTracks.map((track) => (track.id === updatedTrack.id ? updatedTrack : track))
      );
    },
    [setTracks]
  );

  const changeTrackFile = useCallback(
    (trackId: string, filePath: string) => {
      const track = tracks.find((track) => track.id === trackId);
      if (!track) return;

      updateTrack({
        ...track,
        name: getFileNameWithoutExtension(filePath),
        source: {
          type: 'file',
          path: filePath
        }
      });
    },
    [tracks, updateTrack]
  );

  const updateTrackShortcut = useCallback(
    (trackId: string, keybinding: string | null) => {
      setTracks((previousTracks) =>
        previousTracks.map((track) => {
          if (track.id === trackId) {
            return {
              ...track,
              keybinding,
              keybindingMode: 'custom'
            };
          }

          if (keybinding && track.keybinding?.toUpperCase() === keybinding.toUpperCase()) {
            return {
              ...track,
              keybinding: null,
              keybindingMode: 'custom'
            };
          }

          return track;
        })
      );
    },
    [setTracks]
  );

  const removeTrack = useCallback(
    (id: string) => {
      setTracks((previousTracks) => {
        const remainingTracks = previousTracks.filter((track) => track.id !== id);
        return applyShortcutPolicy(remainingTracks);
      });
    },
    [setTracks, applyShortcutPolicy]
  );

  const clearTracks = useCallback(
    (protectedTrackIds: Set<string>) => {
      setTracks((previousTracks) =>
        previousTracks.filter((track) => protectedTrackIds.has(track.id))
      );
    },
    [setTracks]
  );

  return {
    tracks,
    setTracks,
    addTracks,
    addTonalTrack,
    reorderTracks,
    moveTrackToEnd,
    updateTrack,
    changeTrackFile,
    updateTrackShortcut,
    removeTrack,
    clearTracks
  };
};
