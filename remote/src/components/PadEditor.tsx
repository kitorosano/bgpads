import {
  BPM_STEP_INCREMENT,
  MAX_BPM,
  MAX_TRACK_VOLUME,
  MIN_BPM,
  MIN_TRACK_VOLUME,
  TRACK_VOLUME_STEP_INCREMENT,
  type RemoteTrack
} from '@bgpads/shared';
import { useEffect, useState } from 'react';
import './PadEditor.css';

interface Props {
  track: RemoteTrack;
  isActive: boolean;
  onClose: () => void;
  onSave: (changes: Omit<RemoteTrack, 'id'>) => void;
  onDelete: () => void;
}

export function PadEditor({ track, isActive, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(track.name);
  const [color, setColor] = useState(track.color);
  const [volume, setVolume] = useState(track.volume);
  const [bpm, setBpm] = useState(track.bpm);

  useEffect(() => {
    setName(track.name);
    setColor(track.color);
    setVolume(track.volume);
    setBpm(track.bpm);
  }, [track.id]);

  const handleDelete = () => {
    if (isActive) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar el pad "${track.name}"?`
    );
    if (confirmed) onDelete();
  };

  return (
    <div className="pad-editor__overlay" onClick={onClose}>
      <section
        className="pad-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pad-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="pad-editor__header">
          <h2 id="pad-editor-title">Editar pad</h2>

          <button type="button" className="pad-editor__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="pad-editor__content">
          <label>
            Nombre
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label>
            Color
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>

          <label>
            Volumen ({Math.round(volume * 100)}%)
            <input
              type="range"
              min={MIN_TRACK_VOLUME}
              max={MAX_TRACK_VOLUME}
              step={TRACK_VOLUME_STEP_INCREMENT}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </label>

          <label>
            BPM
            <input
              type="number"
              inputMode="decimal"
              min={MIN_BPM}
              max={MAX_BPM}
              step={BPM_STEP_INCREMENT}
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
            />
          </label>

          <button
            type="button"
            disabled={!name.trim() || !Number.isInteger(bpm) || bpm < MIN_BPM || bpm > MAX_BPM}
            onClick={() =>
              onSave({
                name: name.trim(),
                color,
                volume,
                bpm
              })
            }
          >
            Guardar cambios
          </button>

          <button
            type="button"
            className="pad-editor__delete"
            disabled={isActive}
            onClick={handleDelete}
          >
            Eliminar pad
          </button>

          {isActive && (
            <p className="pad-editor__delete-hint">
              No se puede eliminar un pad mientras está reproduciéndose o finalizando su
              reproducción.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
