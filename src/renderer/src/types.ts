import { Language, Theme } from 'src/types';

export interface AudioTrack {
  id: string;
  file: string;
  name: string;
  keybinding: string | null;
  color: string;
  volume: number;
  bpm?: number;
}

export interface AppConfig {
  tracks: AudioTrack[];
  fadeOutDuration: number;
  bpm: number;
  metronomeShortcut: string | null;
  theme: Theme;
  language: Language;
}

export interface ContextMenuState {
  trackId: string;
  position: { x: number; y: number };
}
