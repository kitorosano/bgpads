import { Language, Theme } from 'src/types';

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

export type AudioSource = { type: 'file'; path: string } | { type: 'tonal'; key: TonalPadKey };

export interface AudioTrack {
  id: string;
  source: AudioSource;
  name: string;
  keybinding: string | null;
  keybindingMode: 'auto' | 'custom';
  color: string;
  volume: number;
  bpm: number;
  timeSignature: string;
}

export interface AppConfig {
  theme: Theme;
  language: Language;

  fadeOutDuration: number;
  tonalPadBankPath?: string;
  autoAssignPositionBasedShortcuts?: boolean;
  tracks: AudioTrack[];
  tracksOutputDeviceId?: string;

  bpm: number;
  timeSignature: string;
  metronomeColor: string;
  metronomeVolume: number;
  metronomeShortcut: string | null;

  metronomeFrequency?: number;
  metronomeDecay?: number;
  metronomeHarmonicCount?: number;

  beatAccents?: number[]; // indices of beats to accent
  metronomeAccentFrequency?: number;
  metronomeAccentDecay?: number;
  metronomeAccentHarmonicCount?: number;
  metronomeOutputDeviceId?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface ContextMenuState {
  trackId: string;
  position: Point;
  index: number;
}

export interface Dimensions {
  width: number;
  height: number;
}
