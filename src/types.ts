export type Language = 'es' | 'en';

export type Theme = 'light' | 'dark';

export type MetronomeType = 'custom' | 'sawtooth' | 'sine' | 'square' | 'triangle';

export interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  maximized: boolean;
}

export interface Config {
  theme?: Theme;
  language?: Language;
  fadeOutDuration?: number;
  bpm?: number;
  metronomeShortcut?: string | null;
  metronomeFrequency?: number;
  metronomeDecay?: number;
  metronomeHarmonicCount?: number;
  autoAssignPositionBasedShortcuts?: boolean;
  tracks?: any[];
  windowState?: WindowState;
  timeSignature?: string;
  metronomeColor?: string;
}

export const TONAL_PAD_KEYS = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B'
] as const;

export type TonalPadKey = (typeof TONAL_PAD_KEYS)[number];

export interface TonalPadBankValidation {
  path: string;
  availableKeys: TonalPadKey[];
  missingKeys: TonalPadKey[];
}
