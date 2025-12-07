import { DEFAULT_BPM, MAX_BPM, MIN_BPM } from '../../../constants';

export const clampBpm = (value: number | string): number => {
  const parsed = typeof value === 'string' ? parseInt(value) : value;
  const safeValue = isNaN(parsed) ? DEFAULT_BPM : parsed;
  return Math.max(MIN_BPM, Math.min(MAX_BPM, safeValue));
};
