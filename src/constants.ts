import { Language, MetronomeType, Theme } from './types';

export const CONFIG_FILE_NAME = 'bgpads-config.json';

export const SHORTCUT_KEYS_TO_IGNORE = ['CONTROL', 'SHIFT', 'ALT', 'META'];

export const DEFAULT_CROSSFADE_DURATION = 4;
export const CROSSFADE_STEP_INCREMENT = 0.5;

export const MIN_BPM = 60;
export const MAX_BPM = 240;
export const DEFAULT_BPM = 100;

export const DEFAULT_METRONOME_FREQUENCY = 1050;
export const DEFAULT_METRONOME_DECAY = 0.06;
export const DEFAULT_METRONOME_HARMONIC_COUNT = 3;
export const DEFAULT_METRONOME_VOLUME = 0.5;

export const DEFAULT_TRACK_VOLUME = 1;
export const VOLUME_STEP_INCREMENT = 0.1;

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
