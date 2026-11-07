import type { TonalPadKey } from './tonalPad.js';

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
