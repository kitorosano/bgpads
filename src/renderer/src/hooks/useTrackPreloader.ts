import { useEffect, useRef } from 'react';
import { AudioTrack } from '../types';

const getTrackSourceKey = (track: AudioTrack, tonalPadBankPath?: string): string => {
  switch (track.source.type) {
    case 'file':
      return `file:${track.source.path}`;

    case 'tonal':
      return `tonal:${tonalPadBankPath ?? ''}:${track.source.key}`;
  }
};

export const useTrackPreloader = (
  tracks: AudioTrack[],
  preload: (track: AudioTrack) => Promise<void>,
  tonalPadBankPath?: string
) => {
  const preloadedSourcesRef = useRef(new Set<string>());

  useEffect(() => {
    tracks.forEach((track) => {
      const sourceKey = getTrackSourceKey(track, tonalPadBankPath);
      if (preloadedSourcesRef.current.has(sourceKey)) return;

      preloadedSourcesRef.current.add(sourceKey);

      void preload(track).catch((error) => {
        preloadedSourcesRef.current.delete(sourceKey);

        console.error(`Failed to preload track "${track.name}":`, error);
      });
    });
  }, [tracks, preload, tonalPadBankPath]);
};
