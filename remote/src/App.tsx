import type { RemoteTrack, TonalPadKey } from '@bgpads/shared';
import { useState } from 'react';
import './App.css';
import { ConnectionScreen } from './components/ConnectionScreen';
import { PadEditor } from './components/PadEditor';
import { PadGrid } from './components/PadGrid';
import { PlaybackHeader } from './components/PlaybackHeader';
import { TonalPadPicker } from './components/TonalPadPicker';
import { useRemoteConnection } from './hooks/useRemoteConnection';
import { useScreenWakeLock } from './hooks/useScreenWakeLock';

function App() {
  const { status, remoteState, lastHost, connect, disconnect, sendCommand } = useRemoteConnection();
  useScreenWakeLock(status === 'connected');

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isTonalPickerOpen, setIsTonalPickerOpen] = useState(false);

  if (!remoteState) {
    return (
      <ConnectionScreen
        status={status}
        lastHost={lastHost}
        connect={connect}
        disconnect={disconnect}
      />
    );
  }

  const handleToggleEditMode = () => {
    setIsEditMode((previous) => !previous);
    setSelectedTrackId(null);
    setIsTonalPickerOpen(false);
  };

  const handleOnSave = (changes: Omit<RemoteTrack, 'id'>) => {
    if (!selectedTrackId) return;

    const sent = sendCommand({
      type: 'track.update',
      trackId: selectedTrackId,
      changes
    });

    if (sent) setSelectedTrackId(null);
  };

  const handleOnDelete = () => {
    if (!selectedTrackId) return;

    const sent = sendCommand({
      type: 'track.delete',
      trackId: selectedTrackId
    });

    if (sent) setSelectedTrackId(null);
  };

  const handleAddTonalPad = (key: TonalPadKey) => {
    if (status !== 'connected' || !remoteState.availableTonalKeys.includes(key)) return;

    const sent = sendCommand({
      type: 'track.addTonal',
      key
    });

    if (sent) setIsTonalPickerOpen(false);
  };

  const selectedTrack = remoteState.tracks.find((track) => track.id === selectedTrackId) ?? null;
  const activeTrack = remoteState.tracks.find((track) => track.id === remoteState.playingTrackId);
  const metronomeColor = activeTrack?.color;

  return (
    <main className="app app--playback">
      <PlaybackHeader
        isEditMode={isEditMode}
        bpm={remoteState.bpm}
        metronomePlaying={remoteState.metronomePlaying}
        currentBeat={remoteState.currentBeat}
        timeSignature={remoteState.timeSignature}
        beatAccents={remoteState.beatAccents}
        metronomeColor={metronomeColor}
        status={status}
        sendCommand={sendCommand}
        onToggleEditMode={handleToggleEditMode}
      />

      <PadGrid
        isEditMode={isEditMode}
        disabled={status !== 'connected'}
        tracks={remoteState.tracks}
        playingTrackId={remoteState.playingTrackId}
        fadingOutTrackId={remoteState.fadingOutTrackId}
        fadeOutDuration={remoteState.fadeOutDuration}
        fadeOutStartedAt={remoteState.fadeOutStartedAt}
        playbackProgress={remoteState.playbackProgress}
        currentTime={remoteState.currentTime}
        duration={remoteState.duration}
        sendCommand={sendCommand}
        onSelectTrack={setSelectedTrackId}
      />

      {isEditMode && (
        <button
          type="button"
          className="app__add-tonal"
          disabled={status !== 'connected'}
          onClick={() => setIsTonalPickerOpen(true)}
        >
          <span aria-hidden="true">+</span>
          Agregar pad tonal
        </button>
      )}

      {isEditMode && selectedTrack && (
        <PadEditor
          track={selectedTrack}
          isActive={
            selectedTrack.id === remoteState.playingTrackId ||
            selectedTrack.id === remoteState.fadingOutTrackId
          }
          onClose={() => setSelectedTrackId(null)}
          onSave={handleOnSave}
          onDelete={handleOnDelete}
        />
      )}

      {isEditMode && isTonalPickerOpen && (
        <TonalPadPicker
          availableKeys={remoteState.availableTonalKeys}
          disabled={status !== 'connected'}
          onSelect={handleAddTonalPad}
          onClose={() => setIsTonalPickerOpen(false)}
        />
      )}
    </main>
  );
}

export default App;
