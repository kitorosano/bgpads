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

interface Props {
  track: AudioTrack;
  index: number;
  position: { x: number; y: number };
  onClose: () => void;
  onUpdate: (updatedTrack: AudioTrack) => void;
  onRemove: () => void;
  onStop: () => void;
  onChangeFile: () => void;
  isPlaying: boolean;
  isFadingOut: boolean;
}

interface BpmInputProps {
  value: number;
  placeholder?: string;
  onChange: (value: number) => void;
}

const BpmInput = ({ value, placeholder, onChange }: BpmInputProps) => {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const commitChange = () => {
    if (localValue === '') return;
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
      step="0.1"
      inputMode="decimal"
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={commitChange}
      onKeyDown={handleKeyDown}
      className="context-menu-input"
    />
  );
};

const PRESET_COLORS = ['#a855f7', '#06b6d4', '#eab308', '#f43f5e'];
const TIME_SIGNATURES = ['4/4', '4/8'];

/**
 * Truncates a filename to fit within a constrained space.
 * Preserves the beginning of the name and the file extension,
 * inserting an ellipsis (…) in the middle when truncation is needed.
 */
const truncateFilename = (filePath: string, maxLength = 18): string => {
  // Extract just the filename from the full path
  const filename = filePath.replace(/\\/g, '/').split('/').pop() || filePath;
  if (filename.length <= maxLength) return filename;

  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) {
    // No extension — just truncate with ellipsis
    return filename.slice(0, maxLength - 1) + '…';
  }

  const ext = filename.slice(dotIndex); // e.g. ".mp3"
  const name = filename.slice(0, dotIndex);
  const availableChars = maxLength - ext.length - 1; // -1 for the ellipsis

  if (availableChars <= 2) {
    // Very long extension or very short max — just show what we can
    return filename.slice(0, maxLength - 1) + '…';
  }

  return name.slice(0, availableChars) + '…' + ext;
};

const CustomTimeSignatureInput = ({
  value,
  onChange
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [num, den] = value.split('/');
  const [localNum, setLocalNum] = useState(num || '4');
  const [localDen, setLocalDen] = useState(den || '4');

  useEffect(() => {
    const parts = value.split('/');
    if (parts.length === 2 && !TIME_SIGNATURES.includes(value)) {
      setLocalNum(parts[0]);
      setLocalDen(parts[1]);
    }
  }, [value]);

  const commitChange = () => {
    let n = parseInt(localNum);
    let d = parseInt(localDen);
    if (isNaN(n) || n < 1) n = 4;
    if (isNaN(d) || d < 1) d = 4;
    setLocalNum(n.toString());
    setLocalDen(d.toString());
    // Only update if it's considered valid
    onChange(`${n}/${d}`);
  };

  const forceActive = !TIME_SIGNATURES.includes(value);

  return (
    <div className={`custom-time-sig ${forceActive ? 'active' : ''}`}>
      <input
        type="number"
        value={localNum}
        onChange={(e) => setLocalNum(e.target.value)}
        onBlur={commitChange}
        className="time-sig-input num"
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
      <span className="time-sig-slash">/</span>
      <input
        type="number"
        value={localDen}
        onChange={(e) => setLocalDen(e.target.value)}
        onBlur={commitChange}
        className="time-sig-input den"
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
    </div>
  );
};

export const ContextMenu = ({
  track,
  index,
  position,
  onClose,
  onUpdate,
  onRemove,
  onStop,
  onChangeFile,
  isPlaying,
  isFadingOut
}: Props) => {
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

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

  const customFilePath = track.source.type === 'file' ? track.source.path : null;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
    >
      <div className="context-menu-header">
        <span className="context-menu-title">
          {t('editPad')} {(index + 1).toString().padStart(2, '0')}
        </span>
        <button className="context-menu-close" onClick={onClose}>
          &times;
        </button>
      </div>

      <div className="menu-row">
        <div className="menu-group flex-1">
          <label className="menu-label">{t('padName')}</label>
          <input
            type="text"
            value={track.name}
            onChange={(e) => onUpdate({ ...track, name: e.target.value })}
            className="context-menu-input"
          />
        </div>
      </div>

      <div className="menu-row">
        <div className="menu-group flex-1">
          <div className="flex-between">
            <label className="menu-label">{t('gain')}</label>
            <span className="gain-value" style={{ color: track.color }}>
              {(track.volume * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            className="gain-slider"
            min={MIN_TRACK_VOLUME}
            max={MAX_TRACK_VOLUME}
            step={VOLUME_STEP_INCREMENT}
            value={track.volume}
            onChange={(e) => onUpdate({ ...track, volume: parseFloat(e.target.value) })}
            style={{ accentColor: track.color }}
          />
        </div>
      </div>

      <div className="menu-row">
        <div className="menu-group flex-1">
          <label className="menu-label">{t('activeColor')}</label>
          <div className="color-presets">
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                className={`color-circle ${track.color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => onUpdate({ ...track, color: c })}
              />
            ))}
            <div className="color-circle custom-color-picker">
              <input
                type="color"
                value={track.color}
                onChange={(e) => onUpdate({ ...track, color: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="menu-row">
        <div className="menu-group flex-1">
          <label className="menu-label">{t('key')}</label>
          <button
            className={`key-record-btn ${isRecording ? 'recording' : ''}`}
            onClick={() => setIsRecording(true)}
          >
            {isRecording ? '...' : track.keybinding || t('none')}
          </button>
        </div>
        <div className="menu-group flex-2">
          <label className="menu-label">{t('source')}</label>
          <button className="browse-btn" onClick={onChangeFile} title={customFilePath ?? ''}>
            {customFilePath ? truncateFilename(customFilePath) : t('browse')}
          </button>
        </div>
      </div>

      <div className="menu-row">
        <div className="menu-group flex-1">
          <label className="menu-label">{t('bpm')}</label>
          <BpmInput
            value={track.bpm}
            placeholder={t('global')}
            onChange={(newBpm) => onUpdate({ ...track, bpm: newBpm })}
          />
        </div>
        <div className="menu-group flex-2">
          <label className="menu-label">{t('timeSignature')}</label>
          <div className="time-sig-buttons">
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts}
                className={`time-sig-btn ${track.timeSignature === ts ? 'active' : ''}`}
                onClick={() => onUpdate({ ...track, timeSignature: ts })}
              >
                {ts}
              </button>
            ))}
            <CustomTimeSignatureInput
              value={track.timeSignature || '4/4'}
              onChange={(newTs) => onUpdate({ ...track, timeSignature: newTs })}
            />
          </div>
        </div>
      </div>

      <button
        className="delete-pad-btn"
        onClick={isPlaying ? onStop : onRemove}
        disabled={isFadingOut}
      >
        {isFadingOut
          ? 'DETENIENDO...'
          : isPlaying
            ? 'DETENER'
            : `${t('deletePad')} ${(index + 1).toString().padStart(2, '0')}`}
      </button>
    </div>
  );
};
