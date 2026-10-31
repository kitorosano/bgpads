import { TONAL_PAD_KEYS, TonalPadKey } from '../../../types';
import { useTonalPadBank } from '../hooks/useTonalPadBank';
import { useTracks } from '../hooks/useTracks';

interface Props {
  onPadAdded?: () => void;
}

export const TonalPadSelector = ({ onPadAdded }: Props) => {
  const { validation, isConfigured, isValidating } = useTonalPadBank();
  const { addTonalTrack } = useTracks();

  if (!isConfigured) {
    return (
      <div className="tonal-pad-selector">
        <p>No tonal pad bank configured.</p>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="tonal-pad-selector">
        <p>Validating tonal pad bank...</p>
      </div>
    );
  }

  const availableKeys = new Set(validation?.availableKeys ?? []);

  const handleOnClick = (key: TonalPadKey) => {
    addTonalTrack(key);
    onPadAdded?.();
  };

  return (
    <div className="tonal-pad-selector">
      {TONAL_PAD_KEYS.map((key) => {
        const isAvailable = availableKeys.has(key);

        return (
          <button
            key={key}
            type="button"
            disabled={!isAvailable}
            onClick={() => handleOnClick(key)}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
};
