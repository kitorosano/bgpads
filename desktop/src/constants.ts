import { Language, Theme } from './types';

export const REMOTE_PROGRESS_SYNC_INTERVAL_MS = 100;

export const CONFIG_FILE_NAME = 'bgpads-config-test.json'; // TODO: Restore this to 'bgpads-config.json' when ready for migration to the new config file format

export const SHORTCUT_KEYS_TO_IGNORE = ['CONTROL', 'SHIFT', 'ALT', 'META'];

export const BANK_VALIDATION_INTERVAL_MS = 3000;

export const DEFAULT_CROSSFADE_DURATION = 4;
export const CROSSFADE_STEP_INCREMENT = 0.5;

export const TOP_ROW_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
export const DEFAULT_KEYBINDING = null;
export const DEFAULT_KEYBINDING_MODE = 'auto';

export const DEFAULT_METRONOME_FREQUENCY = 1050; // Hz
export const DEFAULT_METRONOME_DECAY = 0.06; // Seconds
export const DEFAULT_METRONOME_HARMONIC_COUNT = 3;
export const DEFAULT_METRONOME_VOLUME = 0.5;
export const DEFAULT_METRONOME_COLOR = 'var(--accent-color)';
export const MIN_METRONOME_VOLUME = 0;
export const MAX_METRONOME_VOLUME = 1;
export const METRONOME_VOLUME_STEP_INCREMENT = 0.1;

export const DEFAULT_METRONOME_ACCENT_FREQUENCY = 1500;
export const DEFAULT_METRONOME_ACCENT_DECAY = 0.06;
export const DEFAULT_METRONOME_ACCENT_HARMONIC_COUNT = 3;
export const DEFAULT_BEAT_ACCENTS = [0]; // First beat accented by default

export const DEFAULT_METRONOME_TIME_SIGNATURE = '4/4';
export const DEFAULT_METRONOME_TIME_SIGNATURES = ['4/4', '4/8'];

export const DEFAULT_LANGUAGE: Language = 'en';
export const DEFAULT_THEME: Theme = 'dark';

export const DEFAULT_MAIN_WINDOW_WIDTH = 320;
export const DEFAULT_MAIN_WINDOW_HEIGHT = 360;
export const MAIN_WINDOW_MIN_WIDTH = 150;
export const MAIN_WINDOW_MIN_HEIGHT = 150;

export const DEFAULT_SETTINGS_WINDOW_WIDTH = 500;
export const DEFAULT_SETTINGS_WINDOW_HEIGHT = 600;

export const DEFAULT_ABOUT_WINDOW_WIDTH = 400;
export const DEFAULT_ABOUT_WINDOW_HEIGHT = 500;

export const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e' // rose
];
export const DEFAULT_COLORS = ['#a855f7', '#06b6d4', '#eab308', '#f43f5e'];
export const DEFAULT_COLOR = '#666666';
