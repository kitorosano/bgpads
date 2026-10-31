export interface RemoteTrack {
  id: string;
  name: string;
  color: string;
}

export interface RemoteState {
  tracks: RemoteTrack[];
  playingTrackId: string | null;
  fadingOutTrackId: string | null;
  bpm: number;
  metronomePlaying: boolean;
}
