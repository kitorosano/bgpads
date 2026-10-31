import { TonalPadKey } from 'src/types';
import { useTonalPadBank } from '../hooks/useTonalPadBank';
import { useTracks } from '../hooks/useTracks';

export const TonalPadSelector = () => {
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

  const handleOnClick = (key: TonalPadKey) => {
    addTonalTrack(key);
  };

  return (
    <div className="tonal-pad-selector">
      {validation?.availableKeys.map((key) => (
        <button key={key} type="button" onClick={() => handleOnClick(key)}>
          {key}
        </button>
      ))}
    </div>
  );
};
