import { Loading } from '@renderer/components/Loading';
import { useEffect, useRef, useState } from 'react';
import { TOP_ROW_KEYS } from '../../../constants';
import { AudioButton } from '../components/AudioButton';
import { ContextMenu } from '../components/ContextMenu';
import { useAppConfig } from '../hooks/useAppConfig';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMetronome } from '../hooks/useMetronome';
import { useTracks } from '../hooks/useTracks';
import { AudioTrack, ContextMenuState } from '../types';
import { createTrackFromPath, validateTracks } from '../utils/trackUtils';

export const MainPage = () => {
  const { play, isPlaying, preload, setFadeOutDuration, loadingTrackIds } = useAudioPlayer();
  const { tracks, setTracks, updateTrack, removeTrack, changeFile } = useTracks();
  const {
    fadeOutDuration: configFadeOut,
    isLoaded,
    bpm,
    metronomeShortcut,
    tracks: configTracks,
    autoAssignShortcuts,
    updateConfig,
    setBpm
  } = useAppConfig();

  const metronome = useMetronome(bpm);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const initializedRef = useRef(false);

  // Sync fadeOutDuration from config to player
  useEffect(() => {
    setFadeOutDuration(configFadeOut);
  }, [configFadeOut, setFadeOutDuration]);

  // Load tracks from config and preload
  useEffect(() => {
    if (!isLoaded || initializedRef.current) return;

    const init = async () => {
      if (configTracks) {
        const tracksWithVolume = validateTracks(configTracks);

        await Promise.all(tracksWithVolume.map((track: AudioTrack) => preload(track)));
        setTracks(tracksWithVolume);
      }
      setIsPreloading(false);
      initializedRef.current = true;
    };
    init();
  }, [isLoaded, configTracks, preload, setTracks]);

  // IPC Listeners for adding audio
  useEffect(() => {
    const removeAddAudioListener = window.api.onMenuAddAudio(async () => {
      const filePaths = await window.api.openFileDialog();
      if (filePaths && filePaths.length > 0) {
        const newTracks: AudioTrack[] = [];
        const usedKeys = new Set(tracks.map((t) => t.keybinding).filter(Boolean));

        filePaths.forEach((path) => {
          let keybinding: string | null = null;

          if (autoAssignShortcuts) {
            // Find first available key from 1-9
            const availableKey = TOP_ROW_KEYS.find((k) => !usedKeys.has(k));
            if (availableKey) {
              keybinding = availableKey;
              usedKeys.add(availableKey);
            }
          }

          const newTrack = createTrackFromPath(path, { keybinding });
          newTracks.push(newTrack);
          // Preload immediately
          preload(newTrack);
        });

        setTracks((prev) => [...prev, ...newTracks]);
      }
    });

    const removeClearPadsListener = window.api.onMenuClearPads(() => {
      setTracks([]);
    });

    return () => {
      removeAddAudioListener();
      removeClearPadsListener();
    };
  }, [tracks, setTracks, autoAssignShortcuts, preload]);

  // Save config on changes (only tracks, others handled by useAppConfig)
  useEffect(() => {
    if (!isLoaded || isPreloading) return;
    updateConfig({
      tracks
    });
  }, [tracks, isLoaded, isPreloading, updateConfig]);

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();

      // Metronome Shortcut
      if (metronomeShortcut && key === metronomeShortcut) {
        metronome.toggle();
        return;
      }

      const track = tracks.find((t) => t.keybinding === key);
      if (track) {
        // Prevent play if track is loading
        if (loadingTrackIds.has(track.id)) {
          return;
        }

        if (track.bpm) {
          setBpm(track.bpm);
        }
        play(track);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tracks, play, metronomeShortcut, metronome, loadingTrackIds]);

  const onRemoveTrack = (id: string) => {
    removeTrack(id);
    setContextMenu(null);
  };

  const onChangeFile = (id: string) => {
    changeFile(id);
    setContextMenu(null);
  };
  if (!isLoaded || isPreloading) {
    return <Loading />;
  }

  return (
    <div className="app-container">
      <main className="grid-container">
        {tracks.map((track) => (
          <AudioButton
            key={track.id}
            track={track}
            isPlaying={isPlaying === track.id}
            isLoading={loadingTrackIds.has(track.id)}
            onClick={() => {
              if (track.bpm) setBpm(track.bpm);
              play(track);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({
                trackId: track.id,
                position: { x: e.clientX, y: e.clientY }
              });
            }}
          />
        ))}
      </main>

      {contextMenu && (
        <ContextMenu
          track={tracks.find((t) => t.id === contextMenu.trackId)!}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onUpdate={updateTrack}
          onRemove={() => onRemoveTrack(contextMenu.trackId)}
          onChangeFile={() => onChangeFile(contextMenu.trackId)}
        />
      )}
    </div>
  );
};
