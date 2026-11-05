import './App.css';
import { ConnectionScreen } from './components/ConnectionScreen';
import { PadGrid } from './components/PadGrid';
import { PlaybackHeader } from './components/PlaybackHeader';
import { useRemoteConnection } from './hooks/useRemoteConnection';
import { useScreenWakeLock } from './hooks/useScreenWakeLock';

function App() {
  const { status, remoteState, lastHost, connect, disconnect, sendCommand } = useRemoteConnection();
  useScreenWakeLock(status === 'connected');

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

  const activeTrack = remoteState.tracks.find((track) => track.id === remoteState.playingTrackId);
  const metronomeColor = activeTrack?.color;

  return (
    <main className="app app--playback">
      <PlaybackHeader
        bpm={remoteState.bpm}
        metronomePlaying={remoteState.metronomePlaying}
        currentBeat={remoteState.currentBeat}
        timeSignature={remoteState.timeSignature}
        beatAccents={remoteState.beatAccents}
        metronomeColor={metronomeColor}
        status={status}
        sendCommand={sendCommand}
      />
      <PadGrid
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
      />
    </main>
  );
}

export default App;
