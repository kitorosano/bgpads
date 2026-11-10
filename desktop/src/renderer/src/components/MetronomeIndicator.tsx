import { DEFAULT_BEAT_ACCENTS } from '../../../constants';
import { useAppConfig } from '../hooks/useAppConfig';

interface MetronomeIndicatorProps {
  isPlaying: boolean;
  currentBeat: number;
  activeColor?: string;
  beatsPerBar?: number;
  accents?: number[];
  onToggleAccent?: (beatIndex: number) => void;
}

export const MetronomeIndicator = ({
  isPlaying,
  currentBeat,
  activeColor,
  beatsPerBar = 4,
  accents = DEFAULT_BEAT_ACCENTS,
  onToggleAccent
}: MetronomeIndicatorProps) => {
  const { theme } = useAppConfig();

  // Create array of correct length
  const beats = Array.from({ length: beatsPerBar }, (_, i) => i);

  // Use activeColor if available, otherwise fallback to var(--accent-color)
  const color = activeColor || 'var(--accent-color)';

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        padding: '1rem 0',
        width: '100%',
        pointerEvents: 'auto' // Re-enable pointer events for clicking
      }}
    >
      {beats.map((beatIndex) => {
        const isActive = isPlaying && currentBeat === beatIndex;
        const isAccented = accents.includes(beatIndex);

        return (
          <div
            key={beatIndex}
            onClick={() => onToggleAccent?.(beatIndex)}
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: isAccented ? '20%' : '50%', // Square-ish for accent? Or keep round but different border
              backgroundColor: isActive
                ? color
                : isAccented
                  ? theme === 'dark'
                    ? '#555'
                    : '#ccc' // Slightly lighter when accented but not active
                  : theme === 'dark'
                    ? '#333'
                    : '#ddd',
              boxShadow: isActive
                ? `0 0 10px ${color}`
                : isAccented
                  ? theme === 'dark'
                    ? '0 0 5px #777'
                    : '0 0 5px #bbb' // Subtle glow for accent
                  : 'none',
              border: isAccented ? `2px solid ${color}` : '2px solid transparent',
              transition:
                'background-color 0.05s ease, box-shadow 0.05s ease, border-color 0.2s ease, border-radius 0.2s ease',
              opacity: isActive ? 1 : 0.8,
              cursor: 'pointer'
            }}
          />
        );
      })}
    </div>
  );
};
