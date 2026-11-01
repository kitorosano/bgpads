import type { CSSProperties } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { RemoteCommand, RemoteTrack } from '../types';
import './PadGrid.css';

interface Props {
  tracks: RemoteTrack[];
  playingTrackId: string | null;
  fadingOutTrackId: string | null;
  sendCommand: (command: RemoteCommand) => boolean;
}

export function PadGrid({ tracks, playingTrackId, fadingOutTrackId, sendCommand }: Props) {
  const { t } = useI18n();

  const trackCount = tracks.length;
  const gridSize =
    trackCount <= 2 ? 'small' : trackCount <= 6 ? 'medium' : trackCount <= 12 ? 'large' : 'dense';

  return (
    <section className={`pad-grid pad-grid--${gridSize}`} data-track-count={trackCount}>
      {tracks.map((track) => {
        const isPlaying = track.id === playingTrackId;
        const isFading = track.id === fadingOutTrackId;

        return (
          <button
            key={track.id}
            type="button"
            className={`pad ${isPlaying ? 'pad--playing' : isFading ? 'pad--fading' : ''}`}
            style={{ '--pad-color': track.color } as CSSProperties}
            onClick={() => sendCommand({ type: 'track.play', trackId: track.id })}
          >
            <strong className="pad__name">{track.name}</strong>
            {isPlaying && <span className="pad__state">{t('playing')}</span>}
            {isFading && <span className="pad__state">{t('fading')}</span>}
          </button>
        );
      })}
    </section>
  );
}
