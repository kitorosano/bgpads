import { useState, type CSSProperties } from 'react';
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

  if (!remoteState) {
    return (
      <main className="app app--connection">
        <section className="connection">
          <header className="connection__header">
            <h1>BGPads Remote</h1>
            <p>Remote control for BGPads Desktop</p>
          </header>

          <div className="connection__status">
            <span className="connection__status-indicator" />
            <span>{status}</span>
          </div>

          <div className="connection__form">
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
        </section>
      </main>
    );
  }

  const trackCount = remoteState.tracks.length;

  const gridSize =
    trackCount <= 2 ? 'small' : trackCount <= 6 ? 'medium' : trackCount <= 12 ? 'large' : 'dense';

  return (
    <main className="app app--playback">
      <header className="playback-header">
        <div className="playback-header__brand">
          <strong>BGPads</strong>
          <span
            className={`playback-header__connection playback-header__connection--${status}`}
            title={status}
            aria-label={`Connection status: ${status}`}
          >
            <span className="playback-header__connection-indicator" />
          </span>
        </div>

        <div className="playback-header__tempo">
          <div className="playback-header__bpm">
            <strong>{remoteState.bpm}</strong>
            <span>BPM</span>
          </div>

          <button
            type="button"
            className={`playback-header__metronome ${
              remoteState.metronomePlaying ? 'playback-header__metronome--active' : ''
            }`}
            onClick={() => sendCommand({ type: 'metronome.toggle' })}
            aria-label={remoteState.metronomePlaying ? 'Stop metronome' : 'Start metronome'}
            aria-pressed={remoteState.metronomePlaying}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="playback-header__metronome-icon">
              <path
                d="M9 3h6l3 18H6L9 3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M12 7v8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M12 11l3-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8 17h8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <section className={`pad-grid pad-grid--${gridSize}`} data-track-count={trackCount}>
        {remoteState.tracks.map((track) => {
          const isPlaying = track.id === remoteState.playingTrackId;
          const isFading = track.id === remoteState.fadingOutTrackId;

          return (
            <button
              key={track.id}
              type="button"
              className={`pad ${isPlaying ? 'pad--playing' : isFading ? 'pad--fading' : ''}`}
              style={{ '--pad-color': track.color } as CSSProperties}
              onClick={() =>
                sendCommand({
                  type: 'track.play',
                  trackId: track.id
                })
              }
            >
              <strong className="pad__name">{track.name}</strong>

              {isPlaying && <span className="pad__state">Playing</span>}
              {isFading && <span className="pad__state">Fading</span>}
            </button>
          );
        })}
      </section>
    </main>
  );
}

export default App;
