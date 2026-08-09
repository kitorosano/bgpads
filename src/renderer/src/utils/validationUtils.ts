import { DEFAULT_BPM, MAX_BPM, MIN_BPM } from '../../../constants';

export const clampBpm = (value: number | string): number => {
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  const safeValue = Number.isFinite(parsed) ? parsed : DEFAULT_BPM;
  const clampedValue = Math.max(MIN_BPM, Math.min(MAX_BPM, safeValue));
  return Math.round(clampedValue * 10) / 10;
};
