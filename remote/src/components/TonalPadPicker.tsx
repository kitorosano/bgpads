import { TONAL_PAD_KEYS, type TonalPadKey } from '@bgpads/shared';
import './TonalPadPicker.css';

interface Props {
  availableKeys: TonalPadKey[];
  disabled: boolean;
  onSelect: (key: TonalPadKey) => void;
  onClose: () => void;
}

export function TonalPadPicker({ availableKeys, disabled, onSelect, onClose }: Props) {
  return (
    <div className="tonal-picker__overlay" onClick={onClose}>
      <section
        className="tonal-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tonal-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="tonal-picker__header">
          <h2 id="tonal-picker-title">Agregar pad tonal</h2>
          <button
            type="button"
            className="tonal-picker__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        {availableKeys.length === 0 && (
          <p className="tonal-picker__empty">
            No hay tonalidades disponibles. Configurá un banco de pads tonales en BGPads Desktop.
          </p>
        )}

        <div className="tonal-picker__grid">
          {TONAL_PAD_KEYS.map((key) => {
            const isAvailable = availableKeys.includes(key);

            return (
              <button
                key={key}
                type="button"
                className="tonal-picker__key"
                disabled={disabled || !isAvailable}
                onClick={() => onSelect(key)}
              >
                {key}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
