import { useAppConfig } from '../hooks/useAppConfig';

interface MetronomeIndicatorProps {
  isPlaying: boolean;
  currentBeat: number;
  activeColor?: string;
}

const DEFAULT_COMPAS = [0, 1, 2, 3];

export const MetronomeIndicator = ({
  isPlaying,
  currentBeat,
  activeColor
}: MetronomeIndicatorProps) => {
  const { theme } = useAppConfig();

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
        pointerEvents: 'none'
      }}
    >
      {DEFAULT_COMPAS.map((beatIndex) => {
        const isActive = isPlaying && currentBeat === beatIndex;
        return (
          <div
            key={beatIndex}
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              backgroundColor: isActive ? color : theme === 'dark' ? '#333' : '#ddd',
              boxShadow: isActive ? `0 0 10px ${color}` : 'none',
              transition: 'background-color 0.05s ease, box-shadow 0.05s ease',
              opacity: isActive ? 1 : 0.5
            }}
          />
        );
      })}
    </div>
  );
};
