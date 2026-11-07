import { DEFAULT_BPM, MAX_BPM, MAX_TRACK_VOLUME, MIN_BPM, MIN_TRACK_VOLUME } from './audio.js';

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

export const isValidColor = (value: unknown): value is string => {
  const isString = typeof value === 'string';
  const hexRegex = /^#[0-9a-fA-F]{6}$/;

  return isString && hexRegex.test(value);
};

export const isValidVolume = (value: unknown): value is number => {
  const isNumber = typeof value === 'number';
  const isFinite = Number.isFinite(value);
  const isOverMin = isNumber && value >= MIN_TRACK_VOLUME;
  const isUnderMax = isNumber && value <= MAX_TRACK_VOLUME;

  return isNumber && isFinite && isOverMin && isUnderMax;
};

export const isValidBpm = (value: unknown): value is number => {
  const isNumber = typeof value === 'number';
  const isFinite = Number.isFinite(value);
  const isOverMin = isNumber && value >= MIN_BPM;
  const isUnderMax = isNumber && value <= MAX_BPM;

  return isNumber && isFinite && isOverMin && isUnderMax;
};
