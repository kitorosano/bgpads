import { useEffect, useState } from 'react';
import {
  MAX_BPM,
  MAX_TRACK_VOLUME,
  MIN_BPM,
  MIN_TRACK_VOLUME,
  VOLUME_STEP_INCREMENT
} from '../constants';
import type { RemoteTrack } from '../types';
import './PadEditor.css';

interface Props {
  track: RemoteTrack;
  onClose: () => void;
  onSave: (changes: Omit<RemoteTrack, 'id'>) => void;
}

export function PadEditor({ track, onClose, onSave }: Props) {
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
              step={VOLUME_STEP_INCREMENT}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </label>

          <label>
            BPM
            <input
              type="number"
              min={MIN_BPM}
              max={MAX_BPM}
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
        </div>
      </section>
    </div>
  );
}
