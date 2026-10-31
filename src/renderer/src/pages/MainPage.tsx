import { AddPadFab } from '@renderer/components/AddPadFab';
import { Loading } from '@renderer/components/Loading';
import { usePlaybackActions } from '@renderer/hooks/usePlaybackActions';
import { useRemoteControl } from '@renderer/hooks/useRemoteControl';
import { useTrackDragAndDrop } from '@renderer/hooks/useTrackDragAndDrop';
import { useTrackPreloader } from '@renderer/hooks/useTrackPreloader';
import { useTrackShortcuts } from '@renderer/hooks/useTrackShortcuts';
import { useTracksMenu } from '@renderer/hooks/useTracksMenu';
import { useCallback, useEffect, useState } from 'react';
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
    tracksOutputDeviceId,
    tonalPadBankPath,
    fadeOutDuration: configFadeOut,
    isLoading,
    bpm,
    metronomeShortcut,
    updateConfig,
    timeSignature,
    metronomeColor,
    beatAccents,
    setBeatAccents
  } = useAppConfig();

  const {
    tracks,
    setTracks,
    addTracks,
    reorderTracks,
    moveTrackToEnd,
    updateTrack,
    changeTrackFile,
    updateTrackShortcut,
    removeTrack,
    clearTracks
  } = useTracks();

  const {
    play,
    stop,
    isPlaying,
    preload,
    retain,
    release,
    releaseUnreferenced,
    setFadeOutDuration,
    loadingTrackIds,
    setVolume,
    playbackProgress,
    currentTime,
    duration,
    fadingOutTrackId
  } = useAudioPlayer({ tracksOutputDeviceId, tonalPadBankPath });
  const { playTrack, stopPlayback, applyTrackConfig } = usePlaybackActions({
    tracks,
    play,
    stop,
    updateConfig
  });

  useTrackPreloader({
    tracks,
    preload,
    retain,
    release,
    releaseUnreferenced,
    tonalPadBankPath
  });

  const [currentBeat, setCurrentBeat] = useState(0);
  const onBeat = useCallback((beat: number) => {
    setCurrentBeat(beat);
  }, []);
  const metronome = useMetronome(bpm, timeSignature, onBeat);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false);

  useRemoteControl({
    tracks,
    playingTrackId: isPlaying,
    fadingOutTrackId,
    bpm,
    metronomePlaying: metronome.isPlaying,

    playTrack,
    stopPlayback,
    toggleMetronome: metronome.toggle
  });

  useEffect(() => {
    setFadeOutDuration(configFadeOut);
  }, [configFadeOut, setFadeOutDuration]);

  const handleAddFiles = useCallback(async () => {
    const filePaths = await window.api.openFileDialog();
    if (!filePaths || filePaths.length === 0) return;

    addTracks(filePaths);
  }, [addTracks]);

  const handleClearTracks = useCallback(() => {
    const protectedTrackIds = new Set<string>();

    if (isPlaying) {
      protectedTrackIds.add(isPlaying);
    }

    if (fadingOutTrackId) {
      protectedTrackIds.add(fadingOutTrackId);
    }

    clearTracks(protectedTrackIds);
  }, [isPlaying, fadingOutTrackId, clearTracks]);

  useTracksMenu({
    tracks,
    setTracks,
    onAddFiles: handleAddFiles,
    onClearTracks: handleClearTracks
  });

  const {
    draggedTrackId,
    dragOverTrackId,
    handleDragEnd,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragOverGrid,
    handleDropInGrid
  } = useTrackDragAndDrop({
    reorderTracks,
    moveTrackToEnd
  });

  const handleUpdateTrack = (updatedTrack: AudioTrack) => {
    updateTrack(updatedTrack);

    if (isPlaying !== updatedTrack.id) return;

    applyTrackConfig(updatedTrack);
    setVolume(updatedTrack.volume);
  };

  const handleRemoveTrack = (id: string) => {
    removeTrack(id);
    setContextMenu(null);
  };

  useTrackShortcuts({
    tracks,
    metronomeShortcut,
    onTrackShortcut: (track) => playTrack(track.id),
    onMetronomeShortcut: metronome.toggle,
    enabled: !isRecordingShortcut
  });

  const handleToggleAccent = (beatIndex: number) => {
    const newAccents = beatAccents.includes(beatIndex)
      ? beatAccents.filter((b) => b !== beatIndex)
      : [...beatAccents, beatIndex];
    setBeatAccents(newAccents);
  };

  const handleContextMenu = (trackId: string, index: number, event: React.MouseEvent) => {
    event.preventDefault();

    setContextMenu({
      trackId,
      index,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  const handleChangeFile = async (trackId: string) => {
    const filePaths = await window.api.openFileDialog();
    if (!filePaths || filePaths.length === 0) return;

    changeTrackFile(trackId, filePaths[0]);

    setContextMenu(null);
  };

  if (isLoading) return <Loading />;

  const activeTrack = tracks.find((t) => t.id === isPlaying);
  const fallbackTrack = tracks[0];
  const activeMetronomeColor = metronomeColor || activeTrack?.color || fallbackTrack?.color;

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

      <AddPadFab onAddFiles={handleAddFiles} />

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
            onDragEnd={() => handleDragEnd()}
            onDragEnter={(event) => handleDragEnter(track.id, event)}
            onDragOver={(event) => handleDragOver(track.id, event)}
            onDragLeave={() => handleDragLeave(track.id)}
            onDrop={(event) => handleDrop(track.id, event)}
            onClick={() => playTrack(track.id)}
            onContextMenu={(event) => handleContextMenu(track.id, index, event)}
          />
        ))}
      </main>

      {contextMenu && (
        <ContextMenu
          track={tracks.find((t) => t.id === contextMenu.trackId)!}
          index={contextMenu.index}
          position={contextMenu.position}
          isPlaying={isPlaying === contextMenu.trackId}
          isFadingOut={fadingOutTrackId === contextMenu.trackId}
          onUpdate={handleUpdateTrack}
          onClose={() => setContextMenu(null)}
          onRemove={() => handleRemoveTrack(contextMenu.trackId)}
          onChangeFile={() => handleChangeFile(contextMenu.trackId)}
          onStop={stopPlayback}
          onShortcutRecordingChange={setIsRecordingShortcut}
          onShortcutChange={(key) => updateTrackShortcut(contextMenu.trackId, key)}
        />
      )}
    </div>
  );
};
