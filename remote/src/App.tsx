import './App.css';
import { ConnectionScreen } from './components/ConnectionScreen';
import { PadGrid } from './components/PadGrid';
import { PlaybackHeader } from './components/PlaybackHeader';
import { useRemoteConnection } from './hooks/useRemoteConnection';

function App() {
  const { status, remoteState, lastHost, connect, disconnect, sendCommand } = useRemoteConnection();

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

  return (
    <main className="app app--playback">
      <PlaybackHeader
        bpm={remoteState.bpm}
        metronomePlaying={remoteState.metronomePlaying}
        status={status}
        sendCommand={sendCommand}
      />
      <PadGrid
        tracks={remoteState.tracks}
        playingTrackId={remoteState.playingTrackId}
        fadingOutTrackId={remoteState.fadingOutTrackId}
        sendCommand={sendCommand}
      />
    </main>
  );
}

export default App;
