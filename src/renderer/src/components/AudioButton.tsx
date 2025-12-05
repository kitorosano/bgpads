import { AudioTrack } from '../hooks/useAudioPlayer'

interface AudioButtonProps {
  track: AudioTrack
  isPlaying: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

export const AudioButton = ({ track, isPlaying, onClick, onContextMenu }: AudioButtonProps) => {
  return (
    <div
      className={`audio-button-container ${isPlaying ? 'playing' : ''}`}
      style={{ '--button-color': track.color } as React.CSSProperties}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div className="audio-button-content">
        <span className="track-name" title={track.name}>
          {track.name}
        </span>
        {track.keybinding && <span className="keybinding-text">{track.keybinding}</span>}
      </div>
    </div>
  )
}
