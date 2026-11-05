export interface RemoteTrack {
  id: string;
  name: string;
  color: string;
}

export interface RemoteState {
  tracks: RemoteTrack[];
  playingTrackId: string | null;
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
      type: 'track.play';
      trackId: string;
    }
  | {
      type: 'track.stop';
    }
  | {
      type: 'metronome.toggle';
    };

export type ConnectionStatus =
  'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'disconnecting';
