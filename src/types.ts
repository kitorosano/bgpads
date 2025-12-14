export type Language = 'es' | 'en';

export type Theme = 'light' | 'dark';

export type MetronomeType = 'custom' | 'sawtooth' | 'sine' | 'square' | 'triangle';

export interface Config {
  theme?: Theme;
  language?: Language;
  fadeOutDuration?: number;
  bpm?: number;
  metronomeShortcut?: string | null;
  metronomeFrequency?: number;
  metronomeDecay?: number;
  metronomeHarmonicCount?: number;
  autoAssignShortcuts?: boolean;
  tracks?: any[];
}
