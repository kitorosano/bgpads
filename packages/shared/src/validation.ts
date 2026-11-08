import { DEFAULT_BPM, MAX_BPM, MAX_TRACK_VOLUME, MIN_BPM, MIN_TRACK_VOLUME } from './audio.js';
import { TONAL_PAD_KEYS } from './tonalPad.js';

export const clampBpm = (value: number | string): number => {
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  const safeValue = Number.isFinite(parsed) ? parsed : DEFAULT_BPM;
  const clampedValue = Math.max(MIN_BPM, Math.min(MAX_BPM, safeValue));

  return Math.round(clampedValue * 10) / 10;
};

export const isValidText = (value: unknown): value is string => {
  const isString = typeof value === 'string';
  const isNotEmpty = isString && value.trim().length > 0;

  return isString && isNotEmpty;
};

export const isValidNumber = (value: unknown): value is number => {
  const isNumber = typeof value === 'number';
  const isFinite = Number.isFinite(value);

  return isNumber && isFinite;
};

export const isValidColor = (value: unknown): value is string => {
  const isString = typeof value === 'string';
  const hexRegex = /^#[0-9a-fA-F]{6}$/;

  return isString && hexRegex.test(value);
};

export const isValidVolume = (value: unknown): value is number => {
  if (!isValidNumber(value)) return false;

  const isOverMin = value >= MIN_TRACK_VOLUME;
  const isUnderMax = value <= MAX_TRACK_VOLUME;

  return isOverMin && isUnderMax;
};

export const isValidBpm = (value: unknown): value is number => {
  if (!isValidNumber(value)) return false;

  const isOverMin = value >= MIN_BPM;
  const isUnderMax = value <= MAX_BPM;

  return isOverMin && isUnderMax;
};

export const isValidTonalKey = (value: unknown): boolean => {
  if (!isValidText(value)) return false;

  const isIncluded = (TONAL_PAD_KEYS as readonly string[]).includes(value);

  return isIncluded;
};

export const isValidTrack = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const track = value as Record<string, unknown>;

  return (
    isValidText(track.id) &&
    isValidText(track.name) &&
    isValidText(track.color) &&
    isValidVolume(track.volume) &&
    isValidBpm(track.bpm)
  );
};
