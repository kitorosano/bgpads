import { AudioTrack } from '../types';
import { Spinner } from './Spinner';

interface AudioButtonProps {
  track: AudioTrack;
  isPlaying: boolean;
  isLoading?: boolean;
  isFadingOut?: boolean;
  fadeOutDuration?: number; // seconds
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  index: number;
  playbackProgress?: number; // 0 to 1
  currentTime?: number; // seconds
  duration?: number; // seconds
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const AudioButton = ({
  track,
  isPlaying,
  isLoading,
  isFadingOut = false,
  fadeOutDuration = 2,
  onClick,
  onContextMenu,
  index,
  playbackProgress = 0,
  currentTime = 0,
  duration = 0
}: AudioButtonProps) => {
  const handleClick = () => {
    if (!isLoading) {
      onClick();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isLoading) {
      onContextMenu(e);
    }
  };

  return (
    <div
      className={`audio-button-container ${isPlaying ? 'playing' : ''} ${isFadingOut ? 'fading' : ''}`}
      style={
        {
          '--button-color': track.color,
          '--fade-out-duration': `${fadeOutDuration}s`,
          cursor: isLoading ? 'default' : 'pointer'
        } as React.CSSProperties
      }
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {isLoading && <Spinner />}
      <div className="audio-button-content" style={{ opacity: isLoading ? 0.5 : 1 }}>
        <div className="pad-header">
          <span className="pad-index">PAD {(index + 1).toString().padStart(2, '0')}</span>
          {track.keybinding && <span className="keybinding-text">{track.keybinding}</span>}
        </div>
        <span className="track-name" title={track.name}>
          {track.name}
        </span>
        <div className="pad-footer">
          <div className="progress-container">
            {isPlaying ? (
              <span className="progress-text">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            ) : isFadingOut ? (
              <span className="fading-text">FADING...</span>
            ) : (
              <span className="ready-text">READY</span>
            )}
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${playbackProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
