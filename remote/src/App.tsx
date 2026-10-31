import { useState } from 'react';
import './App.css';
import { useRemoteConnection } from './hooks/useRemoteConnection';

function App() {
  const { status, remoteState, connect, disconnect, sendCommand } = useRemoteConnection();

  const [host, setHost] = useState('192.168.1.2'); // TODO: Change default to empty string when testing is done
  const isConnected = status === 'connected';

  return (
    <main className="app">
      <section className="remote">
        <header className="remote__header">
          <h1>BGPads Remote</h1>
          <p>Remote control for BGPads Desktop</p>
        </header>

        <div className="remote__status">
          <span className="remote__status-indicator" />
          <span>{status}</span>
        </div>

        <div className="remote__connection">
          <input
            type="text"
            value={host}
            onChange={(event) => setHost(event.target.value)}
            disabled={isConnected}
            placeholder="Desktop IP"
          />

          {isConnected ? (
            <button onClick={disconnect}>Disconnect</button>
          ) : (
            <button
              onClick={() => connect(host)}
              disabled={status === 'connecting' || !host.trim()}
            >
              {status === 'connecting' ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>

        {remoteState && (
          <div className="remote__state">
            <p>BPM: {remoteState.bpm}</p>
            <p>Metronome: {remoteState.metronomePlaying ? 'On' : 'Off'}</p>
            <p>Pads: {remoteState.tracks.length}</p>

            <div className="remote__tracks">
              {remoteState.tracks.map((track) => {
                const isPlaying = track.id === remoteState.playingTrackId;
                const isFading = track.id === remoteState.fadingOutTrackId;

                return (
                  <button
                    key={track.id}
                    type="button"
                    className="remote__track"
                    onClick={() =>
                      sendCommand({
                        type: 'track.play',
                        trackId: track.id
                      })
                    }
                  >
                    <strong>{track.name}</strong>

                    {isPlaying && <span>Playing</span>}
                    {isFading && <span>Fading</span>}
                  </button>
                );
              })}
            </div>

            <div className="remote__controls">
              <button type="button" onClick={() => sendCommand({ type: 'track.stop' })}>
                Stop
              </button>

              <button type="button" onClick={() => sendCommand({ type: 'metronome.toggle' })}>
                {remoteState.metronomePlaying ? 'Stop metronome' : 'Start metronome'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;

