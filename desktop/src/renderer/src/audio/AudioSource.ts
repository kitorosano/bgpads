import { AudioSource } from '../types';

export interface ResolvedAudioSource {
  key: string;
  path: string;
}

export interface AudioSourceResolverOptions {
  tonalPadBankPath?: string;
}

export const resolveAudioSource = async (
  source: AudioSource,
  options: AudioSourceResolverOptions = {}
): Promise<ResolvedAudioSource> => {
  switch (source.type) {
    case 'file':
      return {
        key: `file:${source.path}`,
        path: source.path
      };

    case 'tonal': {
      if (!options.tonalPadBankPath) {
        throw new Error(`Cannot resolve tonal pad ${source.key}: no tonal pad bank configured`);
      }

      const path = await window.api.resolveTonalPadPath(options.tonalPadBankPath, source.key);

      return {
        key: `tonal:${options.tonalPadBankPath}:${source.key}`,
        path
      };
    }
  }
};
