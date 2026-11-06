import { useState } from 'react';
import './App.css';
import { ConnectionScreen } from './components/ConnectionScreen';
import { PadEditor } from './components/PadEditor';
import { PadGrid } from './components/PadGrid';
import { PlaybackHeader } from './components/PlaybackHeader';
import { useRemoteConnection } from './hooks/useRemoteConnection';
import { useScreenWakeLock } from './hooks/useScreenWakeLock';
import type { RemoteTrack } from './types';

function App() {
  const { status, remoteState, lastHost, connect, disconnect, sendCommand } = useRemoteConnection();
  useScreenWakeLock(status === 'connected');

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

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
  };

  const handleOnSave = (changes: Omit<RemoteTrack, 'id'>) => {
    if (selectedTrackId) {
      const sent = sendCommand({
        type: 'track.update',
        trackId: selectedTrackId,
        changes
      });

      if (sent) {
        setSelectedTrackId(null);
      }
    }
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

      {isEditMode && selectedTrack && (
        <PadEditor
          track={selectedTrack}
          onClose={() => setSelectedTrackId(null)}
          onSave={handleOnSave}
        />
      )}
    </main>
  );
}

export default App;
