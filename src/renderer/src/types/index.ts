export type Language = 'es' | 'en';

export type Theme = 'light' | 'dark';

export interface AudioTrack {
  id: string;
  file: string;
  name: string;
  keybinding: string | null;
  color: string;
  volume: number;
}

export interface AppConfig {
  tracks: AudioTrack[];
  fadeOutDuration: number;
  theme: Theme;
  language: Language;
}

export interface ContextMenuState {
  trackId: string;
  position: { x: number; y: number };
}