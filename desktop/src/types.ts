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

export interface RemoteTrack {
  id: string;
  name: string;
  color: string;
  volume: number;
  bpm: number;
}

export interface RemoteState {
  tracks: RemoteTrack[];
  playingTrackId: string | null;
  availableTonalKeys: TonalPadKey[];

  fadingOutTrackId: string | null;
  fadeOutDuration: number;
  fadeOutStartedAt: number | null;

  bpm: number;
  metronomePlaying: boolean;
  currentBeat: number;
  timeSignature: string;
  beatAccents: number[];

  playbackProgress: number;
  currentTime: number;
  duration: number;
}

export interface RemoteConnectionInfo {
  host: string;
  port: number;
  interfaceName: string;
}

export type RemoteCommand =
  | {
      type: 'metronome.toggle';
    }
  | {
      type: 'track.play';
      trackId: string;
    }
  | {
      type: 'track.stop';
    }
  | {
      type: 'track.update';
      trackId: string;
      changes: Omit<RemoteTrack, 'id'>;
    }
  | {
      type: 'track.reorder';
      sourceTrackId: string;
      targetTrackId: string;
    }
  | {
      type: 'track.delete';
      trackId: string;
    }
  | {
      type: 'track.addTonal';
      key: TonalPadKey;
    };
