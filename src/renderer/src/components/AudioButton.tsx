import { AudioTrack } from '../types';
import { Spinner } from './Spinner';

interface AudioButtonProps {
  track: AudioTrack;
  isPlaying: boolean;
  isLoading?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const AudioButton = ({
  track,
  isPlaying,
  isLoading,
  onClick,
  onContextMenu
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
        {track.keybinding && <span className="keybinding-text">{track.keybinding}</span>}
        <span className="track-name" title={track.name}>
          {track.name}
        </span>
        {track.bpm && <span className="bpm-text">{track.bpm} BPM</span>}
      </div>
    </div>
  );
};
