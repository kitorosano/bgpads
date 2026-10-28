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

export type AudioSource =
  | {
      type: 'file';
      path: string;
    }
  | {
      type: 'builtin';
      id: `tonal:${TonalPadKey}`;
    };

export interface AudioTrack {
  id: string;
  source: AudioSource;
  name: string;
  keybinding: string | null;
  color: string;
  volume: number;
  bpm?: number;
  timeSignature?: string;
}

export interface AppConfig {
  tracks: AudioTrack[];
  fadeOutDuration: number;
  bpm: number;
  metronomeShortcut: string | null;
  theme: Theme;
  language: Language;

  tracksOutputDeviceId?: string;
  metronomeOutputDeviceId?: string;
  timeSignature?: string;
  metronomeColor?: string;
  metronomeVolume?: number;

  metronomeFrequency?: number;
  metronomeDecay?: number;
  metronomeHarmonicCount?: number;

  metronomeAccentFrequency?: number;
  metronomeAccentDecay?: number;
  metronomeAccentHarmonicCount?: number;

  beatAccents?: number[]; // indices of beats to accent
  autoAssignShortcuts?: boolean;
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
