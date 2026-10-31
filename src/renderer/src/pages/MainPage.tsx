import { Loading } from '@renderer/components/Loading';
import { useTrackPreloader } from '@renderer/hooks/useTrackPreloader';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioButton } from '../components/AudioButton';
import { ContextMenu } from '../components/ContextMenu';
import { MetronomeIndicator } from '../components/MetronomeIndicator';
import { useAppConfig } from '../hooks/useAppConfig';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMetronome } from '../hooks/useMetronome';
import { useTracks } from '../hooks/useTracks';
import { AudioTrack, ContextMenuState } from '../types';

export const MainPage = () => {
  const {
    tracks,
    setTracks,
    addTracks,
    addTonalTrack,
    reorderTracks,
    moveTrackToEnd,
    updateTrack,
    removeTrack
  } = useTracks();
  const {
    tracksOutputDeviceId,
    tonalPadBankPath,
    fadeOutDuration: configFadeOut,
    isLoading,
    bpm,
    metronomeShortcut,
    autoAssignPositionBasedShortcuts,
    updateConfig,
    timeSignature,
    metronomeColor,
    beatAccents,
    setBeatAccents
  } = useAppConfig();
  const {
    play,
    isPlaying,
    preload,
    setFadeOutDuration,
    loadingTrackIds,
    setVolume,
    playbackProgress,
    currentTime,
    duration,
    fadingOutTrackId
  } = useAudioPlayer({ tracksOutputDeviceId, tonalPadBankPath });

  useTrackPreloader(tracks, preload, tonalPadBankPath);

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
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [dragOverTrackId, setDragOverTrackId] = useState<string | null>(null);

  useEffect(() => {
    setFadeOutDuration(configFadeOut);
  }, [configFadeOut, setFadeOutDuration]);

  useEffect(() => {
    const removeAddAudioListener = window.api.onMenuAddAudio(async () => {
      const filePaths = await window.api.openFileDialog();
      if (!filePaths || filePaths.length === 0) return;

      addTracks(filePaths);
    });

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
  }, [tracks, setTracks, addTracks, autoAssignPositionBasedShortcuts]);

  const handleToggleAccent = (beatIndex: number) => {
    const newAccents = beatAccents.includes(beatIndex)
      ? beatAccents.filter((b) => b !== beatIndex)
      : [...beatAccents, beatIndex];
    setBeatAccents(newAccents);
  };

  const handleUpdateTrack = (updatedTrack: AudioTrack) => {
    const newTracks = tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t));
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
  };

  const handleRemoveTrack = (id: string) => {
    removeTrack(id);
    setContextMenu(null);
  };

  const clearDragState = () => {
    setDraggedTrackId(null);
    setDragOverTrackId(null);
  };

  const handleDragOverGrid = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDropInGrid = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();

    const sourceTrackId = draggedTrackId || event.dataTransfer.getData('text/plain');

    if (!sourceTrackId) {
      clearDragState();
      return;
    }
    if (dragOverTrackId) return;

    moveTrackToEnd(sourceTrackId);

    clearDragState();
  };

  const handleDragStart = (trackId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', trackId);
    setDraggedTrackId(trackId);
  };

  const handleDragEnter = (trackId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggedTrackId && draggedTrackId !== trackId) {
      setDragOverTrackId(trackId);
    }
  };

  const handleDragOver = (trackId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (draggedTrackId && draggedTrackId !== trackId && dragOverTrackId !== trackId) {
      setDragOverTrackId(trackId);
    }
  };

  const handleDragLeave = (trackId: string) => {
    setDragOverTrackId((current) => (current === trackId ? null : current));
  };

  const handleDrop = (targetTrackId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const sourceTrackId = draggedTrackId || event.dataTransfer.getData('text/plain');
    if (!sourceTrackId || sourceTrackId === targetTrackId) {
      clearDragState();
      return;
    }

    reorderTracks(sourceTrackId, targetTrackId);

    clearDragState();
  };

  const handleClick = useCallback(
    (track: AudioTrack) => {
      const updates: any = {};
      if (track.bpm) updates.bpm = track.bpm;
      if (track.timeSignature) updates.timeSignature = track.timeSignature;
      if (track.color) updates.metronomeColor = track.color;

      if (Object.keys(updates).length > 0) {
        updateConfig(updates);
      }
      play(track);
    },
    [play, updateConfig]
  );

  const handleContextMenu = (trackId: string, index: number, event: React.MouseEvent) => {
    event.preventDefault();

    setContextMenu({
      trackId,
      index,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();

      if (metronomeShortcut && key === metronomeShortcut) {
        metronome.toggle();
        return;
      }

      const track = tracks.find((t) => t.keybinding === key);
      if (track) handleClick(track);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tracks, metronomeShortcut, metronome, handleClick]);

  const handleChangeFile = async (trackId: string) => {
    // Determine the original track ahead of time
    const originalTrack = tracks.find((t) => t.id === trackId);
    if (!originalTrack) return;

    const filePaths = await window.api.openFileDialog();
    if (!filePaths || filePaths.length === 0) return;

    const newPath = filePaths[0];
    const newName =
      newPath
        .split(/[\\/]/)
        .pop()
        ?.replace(/\.mp3$/i, '') || 'Unknown';

    const updatedTrack: AudioTrack = {
      ...originalTrack,
      source: { type: 'file', path: newPath },
      name: newName
    };

    setContextMenu(null);

    updateTrack(updatedTrack);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="app-container">
      <div style={{ flexShrink: 0 }}>
        <MetronomeIndicator
          isPlaying={metronome.isPlaying}
          currentBeat={currentBeat}
          activeColor={activeMetronomeColor}
          beatsPerBar={parseInt(timeSignature.split('/')[0]) || 4}
          accents={beatAccents}
          onToggleAccent={handleToggleAccent}
        />
      </div>
      <button onClick={() => addTonalTrack('C')}>Add tonal C</button>

      <main className="grid-container" onDragOver={handleDragOverGrid} onDrop={handleDropInGrid}>
        {tracks.map((track, index) => (
          <AudioButton
            key={track.id}
            track={track}
            index={index}
            isPlaying={isPlaying === track.id}
            isLoading={loadingTrackIds.has(track.id)}
            isFadingOut={fadingOutTrackId === track.id}
            fadeOutDuration={configFadeOut}
            playbackProgress={isPlaying === track.id ? playbackProgress : 0}
            currentTime={isPlaying === track.id ? currentTime : 0}
            duration={isPlaying === track.id ? duration : 0}
            draggable
            isDragging={draggedTrackId === track.id}
            isDragOver={dragOverTrackId === track.id}
            onDragStart={(event) => handleDragStart(track.id, event)}
            onDragEnd={() => clearDragState()}
            onDragEnter={(event) => handleDragEnter(track.id, event)}
            onDragOver={(event) => handleDragOver(track.id, event)}
            onDragLeave={() => handleDragLeave(track.id)}
            onDrop={(event) => handleDrop(track.id, event)}
            onClick={() => handleClick(track)}
            onContextMenu={(event) => handleContextMenu(track.id, index, event)}
          />
        ))}
      </main>

      {contextMenu && (
        <ContextMenu
          track={tracks.find((t) => t.id === contextMenu.trackId)!}
          index={contextMenu.index}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onUpdate={handleUpdateTrack}
          onRemove={() => handleRemoveTrack(contextMenu.trackId)}
          onChangeFile={() => handleChangeFile(contextMenu.trackId)}
        />
      )}
    </div>
  );
};
