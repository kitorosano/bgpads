import { useI18n } from '@renderer/hooks/useI18n';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  MAX_BPM,
  MAX_TRACK_VOLUME,
  MIN_BPM,
  MIN_TRACK_VOLUME,
  SHORTCUT_KEYS_TO_IGNORE,
  VOLUME_STEP_INCREMENT
} from '../../../constants';
import { AudioTrack } from '../types';
import { calculateMenuPosition } from '../utils/uiUtils';
import { clampBpm } from '../utils/validationUtils';

interface ContextMenuProps {
  track: AudioTrack;
  position: { x: number; y: number };
  onClose: () => void;
  onUpdate: (updatedTrack: AudioTrack) => void;
  onRemove: () => void;
  onChangeFile: () => void;
}

interface BpmInputProps {
  value?: number;
  placeholder?: string;
  onChange: (value?: number) => void;
}

const BpmInput = ({ value, placeholder, onChange }: BpmInputProps) => {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const commitChange = () => {
    if (localValue === '') {
      onChange(undefined);
      return;
    }
    const clamped = clampBpm(localValue);
    // Update local value to clamped version for visual feedback
    setLocalValue(clamped.toString());
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="number"
      min={MIN_BPM}
      max={MAX_BPM}
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={commitChange}
      onKeyDown={handleKeyDown}
      className="context-menu-input"
    />
  );
};

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
          min={MIN_TRACK_VOLUME}
          max={MAX_TRACK_VOLUME}
          step={VOLUME_STEP_INCREMENT}
          value={track.volume}
          onChange={(e) => onUpdate({ ...track, volume: parseFloat(e.target.value) })}
        />
      </div>

      <div className="menu-item">
        <label>{t('name')}</label>
        <input
          type="text"
          value={track.name}
          onChange={(e) => onUpdate({ ...track, name: e.target.value })}
          className="context-menu-input"
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
        <label>{t('padBpm')}</label>
        <BpmInput
          value={track.bpm}
          placeholder={t('global')}
          onChange={(newBpm) => onUpdate({ ...track, bpm: newBpm })}
        />
      </div>

      <div className="menu-item">
        <label>{t('timeSignature')}</label>
        <input
          type="text"
          placeholder="4/4"
          value={track.timeSignature || ''}
          onChange={(e) => onUpdate({ ...track, timeSignature: e.target.value })}
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
