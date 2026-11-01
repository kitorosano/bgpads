import type { CSSProperties } from 'react';
import './MetronomeBeatIndicator.css';

interface Props {
  isPlaying: boolean;
  currentBeat: number;
  timeSignature: string;
  beatAccents: number[];
  activeColor?: string;
}

export function MetronomeBeatIndicator({
  isPlaying,
  currentBeat,
  timeSignature,
  beatAccents,
  activeColor
}: Props) {
  const beatsPerBar = parseInt(timeSignature.split('/')[0]) || 4;
  const beats = Array.from({ length: beatsPerBar }, (_, index) => index);

  const currentBeatIsAccented = isPlaying && beatAccents.includes(currentBeat);

  return (
    <>
      <div
        className={`metronome-beat metronome-beat--portrait ${
          isPlaying ? 'metronome-beat--playing' : ''
        } ${currentBeatIsAccented ? 'metronome-beat--accented' : ''}`}
        style={{ '--metronome-color': activeColor ?? 'currentColor' } as CSSProperties}
        aria-hidden="true"
      >
        <span key={currentBeat} />
      </div>

      <div
        className="metronome-beats metronome-beats--landscape"
        style={{ '--metronome-color': activeColor ?? 'currentColor' } as CSSProperties}
        aria-hidden="true"
      >
        {beats.map((beat) => {
          const isActive = isPlaying && currentBeat === beat;
          const isAccented = beatAccents.includes(beat);

          return (
            <span
              key={beat}
              className={`metronome-beats__beat ${
                isAccented ? 'metronome-beats__beat--accented' : ''
              } ${isActive ? 'metronome-beats__beat--active' : ''}`}
            />
          );
        })}
      </div>
    </>
  );
}
