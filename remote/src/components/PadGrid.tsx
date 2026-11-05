import type { CSSProperties } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { RemoteCommand, RemoteTrack } from '../types';
import { triggerHapticFeedback } from '../utils/haptics';
import { FadeOutProgress } from './FadeOutProgress';
import './PadGrid.css';

interface Props {
  disabled: boolean;
  tracks: RemoteTrack[];
  playingTrackId: string | null;
  playbackProgress: number;
  currentTime: number;
  duration: number;
  fadingOutTrackId: string | null;
  fadeOutDuration: number;
  fadeOutStartedAt: number | null;
  sendCommand: (command: RemoteCommand) => boolean;
}

export function PadGrid({
  disabled,
  tracks,
  playingTrackId,
  playbackProgress,
  currentTime,
  duration,
  fadingOutTrackId,
  fadeOutDuration,
  fadeOutStartedAt,
  sendCommand
}: Props) {
  const { t } = useI18n();

  const handleOnClick = (trackId: string) => {
    const sent = sendCommand({ type: 'track.play', trackId });
    if (sent) triggerHapticFeedback();
  };

  const trackCount = tracks.length;
  const gridSize =
    trackCount <= 2 ? 'small' : trackCount <= 6 ? 'medium' : trackCount <= 12 ? 'large' : 'dense';
  const columns = trackCount <= 2 ? 1 : trackCount <= 6 ? 2 : trackCount <= 12 ? 3 : 4;
  const landscapeColumns = trackCount <= 2 ? 2 : trackCount <= 6 ? 3 : trackCount <= 12 ? 4 : 6;
  const rows = Math.ceil(trackCount / columns);
  const landscapeRows = Math.ceil(trackCount / landscapeColumns);

  const formatRemainingTime = (currentTime: number, duration: number): string => {
    const remaining = Math.max(0, Math.ceil(duration - currentTime));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return `−${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <section
      className={`pad-grid pad-grid--${gridSize}`}
      data-track-count={trackCount}
      style={
        {
          '--grid-columns': columns,
          '--grid-landscape-columns': landscapeColumns,
          '--grid-rows': rows,
          '--grid-landscape-rows': landscapeRows
        } as CSSProperties
      }
    >
      {tracks.map((track) => {
        const isPlaying = track.id === playingTrackId;
        const isFading = track.id === fadingOutTrackId;

        return (
          <button
            key={track.id}
            type="button"
            className={`pad ${isPlaying ? 'pad--playing' : isFading ? 'pad--fading' : ''}`}
            style={{ '--pad-color': track.color } as CSSProperties}
            disabled={disabled}
            onClick={() => handleOnClick(track.id)}
          >
            <strong className="pad__name">{track.name}</strong>

            {isFading && <span className="pad__state">{t('fading')}</span>}
            {isFading && fadeOutStartedAt !== null && (
              <FadeOutProgress
                key={fadeOutStartedAt}
                startedAt={fadeOutStartedAt}
                duration={fadeOutDuration}
              />
            )}

            {isPlaying && duration > 0 && (
              <span className="pad__remaining-time">
                {formatRemainingTime(currentTime, duration)}
              </span>
            )}
            {isPlaying && (
              <span className="pad-grid__progress" aria-hidden="true">
                <span
                  className="pad-grid__progress-fill"
                  style={{
                    width: `${Math.min(Math.max(playbackProgress, 0), 1) * 100}%`
                  }}
                />
              </span>
            )}
          </button>
        );
      })}
    </section>
  );
}
