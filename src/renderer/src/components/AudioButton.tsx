import { AudioTrack } from '../types';
import { Spinner } from './Spinner';

interface AudioButtonProps {
  track: AudioTrack;
  isPlaying: boolean;
  isLoading?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  index: number;
}

export const AudioButton = ({
  track,
  isPlaying,
  isLoading,
  onClick,
  onContextMenu,
  index
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
      className={`audio-button-container ${isPlaying ? 'playing' : ''}`}
      style={
        {
          '--button-color': track.color,
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
          {isPlaying ? (
            <div className="progress-container">
              <span className="progress-text">-- : -- / -- : --</span>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" />
              </div>
            </div>
          ) : (
            <span className="ready-text">READY</span>
          )}
        </div>
      </div>
    </div>
  );
};
