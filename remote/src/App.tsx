import { useState } from 'react';
import './App.css';
import { useRemoteConnection } from './hooks/useRemoteConnection';

function App() {
  const { status, remoteState, connect, disconnect } = useRemoteConnection();

  const [host, setHost] = useState('localhost');
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

            <ul>
              {remoteState.tracks.map((track) => (
                <li key={track.id}>
                  {track.name}
                  {track.id === remoteState.playingTrackId && ' — Playing'}
                  {track.id === remoteState.fadingOutTrackId && ' — Fading'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;

