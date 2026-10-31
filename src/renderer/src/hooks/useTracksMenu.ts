import { AudioTrack } from '@renderer/types';
import { useEffect } from 'react';
import { useAppConfig } from './useAppConfig';

interface Props {
  tracks: AudioTrack[];
  setTracks: React.Dispatch<React.SetStateAction<AudioTrack[]>>;
  onAddFiles: () => Promise<void>;
}

export const useTracksMenu = ({ tracks, setTracks, onAddFiles }: Props) => {
  const { autoAssignPositionBasedShortcuts } = useAppConfig();

  useEffect(() => {
    const removeAddAudioListener = window.api.onMenuAddAudio(() => onAddFiles());

    const removeClearPadsListener = window.api.onMenuClearPads(() => {
      setTracks([]);
    });

    const removeExportListener = window.api.onMenuExportTracks(async () => {
      if (tracks.length === 0) return;

      const content = JSON.stringify(tracks, null, 2);
      await window.api.saveTracksFile(content);
    });

    const removeImportListener = window.api.onMenuImportTracks(async () => {
      try {
        const importedTracks = await window.api.loadTracksFile();

        if (importedTracks && Array.isArray(importedTracks)) {
          const tracks = importedTracks as AudioTrack[];

          if (tracks.length > 0) {
            setTracks(tracks);
          }
        }
      } catch (error) {
        console.error('Error importing tracks:', error);
      }
    });

    return () => {
      removeAddAudioListener();
      removeClearPadsListener();
      removeExportListener();
      removeImportListener();
    };
  }, [tracks, setTracks, onAddFiles, autoAssignPositionBasedShortcuts]);
};
