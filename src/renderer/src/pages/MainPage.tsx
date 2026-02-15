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
  const { play, isPlaying, preload, setFadeOutDuration, loadingTrackIds, setVolume } =
    useAudioPlayer();
  const { tracks, setTracks, updateTrack, removeTrack } = useTracks();
  const {
    fadeOutDuration: configFadeOut,
    isLoading,
    bpm,
    metronomeShortcut,
    tracks: configTracks,
    autoAssignShortcuts,
    updateConfig,
    timeSignature,
    metronomeColor,
    beatAccents,
    setBeatAccents
  } = useAppConfig();

  // Metronome Visual State
  const [currentBeat, setCurrentBeat] = useState(0);
  const beatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onBeat = useCallback((beat: number) => {
    setCurrentBeat(beat);
    if (beatTimeoutRef.current) clearTimeout(beatTimeoutRef.current);
    // Don't need to clear beat state anymore because we switch active dot
  }, []);

  const activeTrack = tracks.find((t) => t.id === isPlaying);
  const fallbackTrack = tracks[0];
  // Prefer persisted color, fallback to active active track (should update persisted), fallback to default
  const activeMetronomeColor = metronomeColor || activeTrack?.color || fallbackTrack?.color;

  // Use global timeSignature (which is updated when pads are played)
  const metronome = useMetronome(bpm, timeSignature, onBeat);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const initializedRef = useRef(false);
  const isManualUpdate = useRef(false);

  // Sync fadeOutDuration from config to player
  useEffect(() => {
    setFadeOutDuration(configFadeOut);
  }, [configFadeOut, setFadeOutDuration]);

  // Load tracks from config and preload
  // Load tracks from config and preload
  useEffect(() => {
    if (isLoading || initializedRef.current) return;

    const init = async () => {
      if (configTracks) {
        const tracksWithVolume = validateTracks(configTracks);

        // Render tracks immediately
        setTracks(tracksWithVolume);

        // Preload in background (individual spinners will show)
        tracksWithVolume.forEach((track: AudioTrack) => preload(track));
      }
      initializedRef.current = true;
    };
    init();
  }, [isLoading, configTracks, preload, setTracks]);

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

    // Import/Export Listeners
    const removeExportListener = window.api.onMenuExportTracks(async () => {
      if (tracks.length === 0) return;

      // We export the tracks array as JSON
      const content = JSON.stringify(tracks, null, 2);
      await window.api.saveTracksFile(content);
    });

    const removeImportListener = window.api.onMenuImportTracks(async () => {
      try {
        const importedTracks = await window.api.loadTracksFile();
        if (importedTracks && Array.isArray(importedTracks)) {
          // Validate structure minimally
          const validTracks = validateTracks(importedTracks);

          if (validTracks.length > 0) {
            // Render tracks immediately
            setTracks(validTracks);

            // Preload in background
            validTracks.forEach((track) => preload(track));

            // Trigger config update immediately to persist
            isManualUpdate.current = true; // Avoid circular update trigger if needed, but here we want to persist
            // Actually, we WANT to persist, so we let the effect run or call updateConfig manually.
            // The existing effect [tracks, ...] will catch setTracks and save.
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
  }, [tracks, setTracks, autoAssignShortcuts, preload]);

  // Save config on changes (only tracks, others handled by useAppConfig)
  // Save config on changes (only tracks, others handled by useAppConfig)
  useEffect(() => {
    if (isLoading) return;
    if (isManualUpdate.current) {
      isManualUpdate.current = false;
      return;
    }
    updateConfig({
      tracks
    });
  }, [tracks, isLoading, updateConfig]);

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

        const updates: any = {};
        if (track.bpm) updates.bpm = track.bpm;
        if (track.timeSignature) updates.timeSignature = track.timeSignature;
        if (track.color) updates.metronomeColor = track.color;

        if (Object.keys(updates).length > 0) {
          updateConfig(updates);
        }
        play(track);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tracks, play, metronomeShortcut, metronome, loadingTrackIds, updateConfig]);

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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="app-container">
      {/* Visual Metronome - Needs to be flexible to push grid down */}
      <div style={{ flexShrink: 0 }}>
        <MetronomeIndicator
          isPlaying={metronome.isPlaying}
          currentBeat={currentBeat}
          activeColor={activeMetronomeColor}
          beatsPerBar={parseInt(timeSignature.split('/')[0]) || 4}
          accents={beatAccents}
          onToggleAccent={(beatIndex) => {
            const newAccents = beatAccents.includes(beatIndex)
              ? beatAccents.filter((b) => b !== beatIndex)
              : [...beatAccents, beatIndex];
            setBeatAccents(newAccents);
          }}
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
              const updates: any = {};
              if (track.bpm) updates.bpm = track.bpm;
              if (track.timeSignature) updates.timeSignature = track.timeSignature;
              if (track.color) updates.metronomeColor = track.color;

              if (Object.keys(updates).length > 0) {
                updateConfig(updates);
              }
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
            if (isPlaying === updatedTrack.id) {
              if (updatedTrack.bpm) updates.bpm = updatedTrack.bpm;
              if (updatedTrack.timeSignature) updates.timeSignature = updatedTrack.timeSignature;
              if (updatedTrack.color) updates.metronomeColor = updatedTrack.color;
              // Update volume in real-time if playing
              setVolume(updatedTrack.volume);
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
