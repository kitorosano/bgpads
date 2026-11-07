import { useI18n } from '@renderer/hooks/useI18n';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DEFAULT_COLORS,
  DEFAULT_METRONOME_TIME_SIGNATURES,
  MAX_TRACK_VOLUME,
  MIN_TRACK_VOLUME,
  SHORTCUT_KEYS_TO_IGNORE,
  VOLUME_STEP_INCREMENT
} from '../../../constants';
import { AudioTrack } from '../types';
import { calculateMenuPosition, truncateFilename } from '../utils/uiUtils';
import { BpmInput } from './BpmInput';
import { CustomTimeSignatureInput } from './CustomTimeSignatureInput';

interface Props {
  track: AudioTrack;
  index: number;
  position: { x: number; y: number };
  isPlaying: boolean;
  isFadingOut: boolean;
  onClose: () => void;
  onUpdate: (updatedTrack: AudioTrack) => void;
  onRemove: () => void;
  onStop: () => void;
  onChangeFile: () => void;
  onShortcutRecordingChange: (isRecording: boolean) => void;
  onShortcutChange: (keybinding: string | null) => void;
}

export const ContextMenu = ({
  track,
  index,
  position,
  isPlaying,
  isFadingOut,
  onClose,
  onUpdate,
  onRemove,
  onStop,
  onChangeFile,
  onShortcutRecordingChange,
  onShortcutChange
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

      onShortcutChange(key);
      setIsRecording(false);
      onShortcutRecordingChange(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, track, onShortcutChange, onShortcutRecordingChange]);

  useEffect(() => {
    return () => {
      onShortcutRecordingChange(false);
    };
  }, [onShortcutRecordingChange]);

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

  const handleClick = () => {
    setIsRecording(true);
    onShortcutRecordingChange(true);
  };

  const customFilePath = track.source.type === 'file' ? track.source.path : null;
  const isTrackActive = isPlaying || isFadingOut;

  const padNumber = (index + 1).toString().padStart(2, '0');
  const title = `${t('editPad')} ${padNumber}`;
  const stoppingPadText = `${t('stoppingPad')} ${padNumber}`;
  const stopPadText = `${t('stopPad')} ${padNumber}`;
  const deletePadText = `${t('deletePad')} ${padNumber}`;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
    >
      <div className="context-menu-header">
        <span className="context-menu-title">{title}</span>
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
            {DEFAULT_COLORS.map((c) => (
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
            onClick={handleClick}
          >
            {isRecording ? '...' : track.keybinding || t('none')}
          </button>
        </div>
        <div className="menu-group flex-2">
          <label className="menu-label">{t('source')}</label>
          <button
            className="browse-btn"
            onClick={onChangeFile}
            title={customFilePath ?? ''}
            disabled={isTrackActive}
          >
            {customFilePath ? truncateFilename(customFilePath) : t('browse')}
          </button>
        </div>
      </div>

      <div className="menu-row">
        <div className="menu-group flex-1">
          <label className="menu-label">{t('bpm')}</label>
          <BpmInput value={track.bpm} onChange={(newBpm) => onUpdate({ ...track, bpm: newBpm })} />
        </div>
        <div className="menu-group flex-2">
          <label className="menu-label">{t('timeSignature')}</label>
          <div className="time-sig-buttons">
            {DEFAULT_METRONOME_TIME_SIGNATURES.map((ts) => (
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
        className={isTrackActive ? 'stop-pad-btn' : 'delete-pad-btn'}
        onClick={isPlaying ? onStop : onRemove}
        disabled={isFadingOut}
      >
        {isFadingOut ? stoppingPadText : isPlaying ? stopPadText : deletePadText}
      </button>
    </div>
  );
};
