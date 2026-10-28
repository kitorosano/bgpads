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

    case 'builtin':
      return {
        key: `builtin:${source.id}`,
        path: resolveBuiltinAudioPath(source.id)
      };
  }
};

const resolveBuiltinAudioPath = (id: Extract<AudioSource, { type: 'builtin' }>['id']): string => {
  throw new Error(`Builtin audio source not implemented yet: ${id}`);
};

export const getTrackAudioSource = (track: AudioTrack): AudioSource => track.source;
