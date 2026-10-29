import { AudioSource, AudioTrack } from '../types';

export interface ResolvedAudioSource {
  key: string;
  path: string;
}

export const resolveAudioSource = (source: AudioSource): ResolvedAudioSource => {
  switch (source.type) {
    case 'file':
      return {
        key: `file:${source.path}`,
        path: source.path
      };

    case 'tonal':
      throw new Error(`Tonal audio source not implemented yet: ${source.key}`);
  }
};

export const getTrackAudioSource = (track: AudioTrack): AudioSource => track.source;
