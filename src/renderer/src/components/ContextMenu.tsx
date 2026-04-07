
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
  index: number;
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

const PRESET_COLORS = ['#a855f7', '#06b6d4', '#eab308', '#f43f5e'];
const TIME_SIGNATURES = ['4/4', '3/4', '4/8', '3/8'];

export const ContextMenu = ({
  track,
  index,
  position,
  onClose,
  onUpdate,
  onRemove,
  onChangeFile
}: ContextMenuProps) => {
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

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
    >
      <div className="context-menu-header">
        <span className="context-menu-title">EDIT PAD {(index + 1).toString().padStart(2, '0')}</span>
        <button className="context-menu-close" onClick={onClose}>&times;</button>
      </div>

      <div className="menu-group">
        <label className="menu-label">PAD NAME</label>
        <input
          type="text"
          value={track.name}
          onChange={(e) => onUpdate({ ...track, name: e.target.value })}
          className="context-menu-input"
        />
      </div>

      <div className="menu-group">
        <div className="flex-between">
          <label className="menu-label">GAIN</label>
          <span className="gain-value">{(track.volume * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          className="gain-slider"
          min={MIN_TRACK_VOLUME}
          max={MAX_TRACK_VOLUME}
          step={VOLUME_STEP_INCREMENT}
          value={track.volume}
          onChange={(e) => onUpdate({ ...track, volume: parseFloat(e.target.value) })}
        />
      </div>

      <div className="menu-group">
        <label className="menu-label">ACTIVE COLOR</label>
        <div className="color-presets">
          {PRESET_COLORS.map(c => (
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

      <div className="menu-row">
        <div className="menu-group flex-1">
          <label className="menu-label">KEY</label>
          <button
            className={`key-record-btn ${isRecording ? 'recording' : ''}`}
            onClick={() => setIsRecording(true)}
          >
            {isRecording ? '...' : track.keybinding || 'none'}
          </button>
        </div>
        <div className="menu-group flex-1">
          <label className="menu-label">SOURCE</label>
          <button className="browse-btn" onClick={onChangeFile}>
             Browse
          </button>
        </div>
      </div>

      <div className="menu-row">
        <div className="menu-group flex-1">
          <label className="menu-label">BPM</label>
          <BpmInput
            value={track.bpm}
            placeholder="Global"
            onChange={(newBpm) => onUpdate({ ...track, bpm: newBpm })}
          />
        </div>
        <div className="menu-group flex-2">
          <label className="menu-label">TIME SIGNATURE</label>
          <div className="time-sig-buttons">
            {TIME_SIGNATURES.map(ts => (
              <button 
                key={ts} 
                className={`time-sig-btn ${track.timeSignature === ts ? 'active' : ''}`}
                onClick={() => onUpdate({ ...track, timeSignature: ts })}
              >
                {ts}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="delete-pad-btn" onClick={onRemove}>
        DELETE PAD
      </button>
    </div>
  );
};
