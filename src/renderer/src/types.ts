import { Language, Theme } from 'src/types';

export interface AudioTrack {
  id: string;
  file: string;
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
  // Accent Configuration
  metronomeAccentFrequency?: number;
  metronomeAccentDecay?: number;
  metronomeAccentHarmonicCount?: number;
  beatAccents?: number[]; // indices of beats to accent
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
