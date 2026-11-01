import { useState } from 'react';
import './assets/App.css';
import { useRemoteConnection } from './hooks/useRemoteConnection';

function App() {
  const { status, remoteState, lastHost, connect, disconnect, sendCommand } = useRemoteConnection();

  const [host, setHost] = useState(lastHost);
  const hasActiveConnection =
    status === 'connecting' ||
    status === 'connected' ||
    status === 'reconnecting' ||
    status === 'disconnecting';

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
            disabled={hasActiveConnection}
            placeholder="Desktop IP"
          />

          {hasActiveConnection ? (
            <button onClick={disconnect} disabled={status === 'disconnecting'}>
              {status === 'disconnecting' ? 'Disconnecting...' : 'Disconnect'}
            </button>
          ) : (
            <button onClick={() => connect(host)} disabled={!host.trim()}>
              Connect
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
