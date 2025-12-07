import { useI18n } from '@renderer/hooks/useI18n';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SHORTCUT_KEYS_TO_IGNORE, VOLUME_STEP_INCREMENT } from '../../../constants';
import { AudioTrack } from '../types';
import { calculateMenuPosition } from '../utils/uiUtils';

interface ContextMenuProps {
  track: AudioTrack;
  position: { x: number; y: number };
  onClose: () => void;
  onUpdate: (updatedTrack: AudioTrack) => void;
  onRemove: () => void;
  onChangeFile: () => void;
}

export const ContextMenu = ({
  track,
  position,
  onClose,
  onUpdate,
  onRemove,
  onChangeFile
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const { t } = useI18n();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const key = e.key.toUpperCase();
      if (SHORTCUT_KEYS_TO_IGNORE.includes(key)) return;

      onUpdate({ ...track, keybinding: key });
      setIsRecording(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, track, onUpdate]);

  // Boundary detection
  useLayoutEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const windowDimensions = { width: window.innerWidth, height: window.innerHeight };
    const menuDimensions = { width: menuRect.width, height: menuRect.height };

    const newPos = calculateMenuPosition(position, menuDimensions, windowDimensions);

    setAdjustedPosition(newPos);
  }, [position]);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
    >
      <div className="menu-item">
        <label>
          {t('volume')}: {(track.volume * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step={VOLUME_STEP_INCREMENT}
          value={track.volume}
          onChange={(e) => onUpdate({ ...track, volume: parseFloat(e.target.value) })}
        />
      </div>

      <div className="menu-item">
        <label>{t('keybinding')}</label>
        <button
          className={`key-record-btn ${isRecording ? 'recording' : ''}`}
          onClick={() => setIsRecording(true)}
        >
          {isRecording ? t('pressAnyKey') : track.keybinding || t('none')}
        </button>
      </div>

      <div className="menu-item">
        <label>Pad BPM (Optional)</label>
        <input
          type="number"
          min="40"
          max="240"
          placeholder="Global"
          value={track.bpm || ''}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : parseInt(e.target.value);
            onUpdate({ ...track, bpm: val });
          }}
          style={undefined}
          className="context-menu-input"
        />
      </div>

      <div className="menu-item">
        <label>{t('color')}</label>
        <input
          type="color"
          value={track.color}
          onChange={(e) => onUpdate({ ...track, color: e.target.value })}
        />
      </div>

      <div className="menu-separator" />

      <div className="menu-item action" onClick={onChangeFile}>
        {t('changeFile')}
      </div>

      <div className="menu-item action danger" onClick={onRemove}>
        {t('removeAudio')}
      </div>
    </div>
  );
};
