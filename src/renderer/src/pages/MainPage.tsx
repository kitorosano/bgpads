import { Loading } from '@renderer/components/Loading';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TOP_ROW_KEYS } from '../../../constants';
import { AudioButton } from '../components/AudioButton';
import { ContextMenu } from '../components/ContextMenu';
import { MetronomeIndicator } from '../components/MetronomeIndicator';
import { useAppConfig } from '../hooks/useAppConfig';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMetronome } from '../hooks/useMetronome';
import { useTracks } from '../hooks/useTracks';
import { AudioTrack, ContextMenuState } from '../types';
import { createTrackFromPath, validateTracks } from '../utils/trackUtils';

export const MainPage = () => {
  const { play, isPlaying, preload, setFadeOutDuration, loadingTrackIds } = useAudioPlayer();
  const { tracks, setTracks, updateTrack, removeTrack } = useTracks();
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

  // Metronome Visual State
  const [currentBeat, setCurrentBeat] = useState(0);
  const beatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onBeat = useCallback((beat: number) => {
    setCurrentBeat(beat);
    if (beatTimeoutRef.current) clearTimeout(beatTimeoutRef.current);
    // Don't need to clear beat state anymore because we switch active dot
  }, []);

  const metronome = useMetronome(bpm, onBeat);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const initializedRef = useRef(false);
  const isManualUpdate = useRef(false);

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
    if (isManualUpdate.current) {
      isManualUpdate.current = false;
      return;
    }
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

  const handleChangeFile = async (trackId: string) => {
    // Determine the original track ahead of time
    const originalTrack = tracks.find((t) => t.id === trackId);
    if (!originalTrack) return;

    // Use native file dialog
    const filePaths = await window.api.openFileDialog();
    if (!filePaths || filePaths.length === 0) return;

    const newPath = filePaths[0];
    const newName = newPath.split(/[\\/]/).pop()?.replace('.mp3', '') || 'Unknown';

    const updatedTrack: AudioTrack = {
      ...originalTrack,
      file: newPath,
      name: newName
    };

    // Close menu immediately
    setContextMenu(null);

    // 1. Preload immediately (shows spinner)
    preload(updatedTrack);

    // 2. Update state
    updateTrack(updatedTrack);
  };

  if (!isLoaded || isPreloading) {
    return <Loading />;
  }

  // Determine active color for metronome
  const activeTrack = tracks.find((t) => t.id === isPlaying);
  const fallbackTrack = tracks[0];
  const activeMetronomeColor = activeTrack?.color || fallbackTrack?.color;

  return (
    <div className="app-container">
      {/* Visual Metronome - Needs to be flexible to push grid down */}
      <div style={{ flexShrink: 0 }}>
        <MetronomeIndicator
          isPlaying={metronome.isPlaying}
          currentBeat={currentBeat}
          activeColor={activeMetronomeColor}
        />
      </div>

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
          onUpdate={(updatedTrack) => {
            const newTracks = tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t));
            isManualUpdate.current = true;
            setTracks(newTracks);

            const updates: any = { tracks: newTracks };
            // If the playing track is updated and has a specific BPM, update the global engine immediately
            if (isPlaying === updatedTrack.id && updatedTrack.bpm) {
              updates.bpm = updatedTrack.bpm;
            }
            updateConfig(updates);
          }}
          onRemove={() => onRemoveTrack(contextMenu.trackId)}
          onChangeFile={() => handleChangeFile(contextMenu.trackId)}
        />
      )}
    </div>
  );
};
