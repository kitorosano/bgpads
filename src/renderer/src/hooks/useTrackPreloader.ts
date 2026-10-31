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

interface Props {
  tracks: AudioTrack[];
  preload: (track: AudioTrack) => Promise<string>;
  retain: (audioKey: string) => void;
  release: (audioKey: string) => boolean;
  tonalPadBankPath?: string;
}

interface RetainedTrack {
  sourceKey: string;
  audioKey: string;
}

export const useTrackPreloader = ({
  tracks,
  preload,
  retain,
  release,
  tonalPadBankPath
}: Props) => {
  const tracksRef = useRef(tracks);
  const retainedTracksRef = useRef(new Map<string, RetainedTrack>());
  const loadingTracksRef = useRef(new Map<string, string>());

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    const currentTracks = new Map(
      tracks.map((track) => [track.id, getTrackSourceKey(track, tonalPadBankPath)])
    );

    // Release tracks that were removed or whose source changed.
    for (const [trackId, retained] of retainedTracksRef.current) {
      const currentSourceKey = currentTracks.get(trackId);

      if (currentSourceKey === retained.sourceKey) continue;

      release(retained.audioKey);
      retainedTracksRef.current.delete(trackId);
    }

    // Preload tracks that are new or whose source changed.
    for (const track of tracks) {
      const sourceKey = getTrackSourceKey(track, tonalPadBankPath);
      const retained = retainedTracksRef.current.get(track.id);

      if (retained?.sourceKey === sourceKey) continue;
      if (loadingTracksRef.current.get(track.id) === sourceKey) continue;

      loadingTracksRef.current.set(track.id, sourceKey);

      void preload(track)
        .then((audioKey) => {
          if (loadingTracksRef.current.get(track.id) === sourceKey) {
            loadingTracksRef.current.delete(track.id);
          }

          const currentTrack = tracksRef.current.find((candidate) => candidate.id === track.id);
          const currentSourceKey = currentTrack
            ? getTrackSourceKey(currentTrack, tonalPadBankPath)
            : null;
          // Track was deleted or changed while loading.
          if (currentSourceKey !== sourceKey) return;

          retain(audioKey);

          retainedTracksRef.current.set(track.id, {
            sourceKey,
            audioKey
          });
        })
        .catch((error) => {
          if (loadingTracksRef.current.get(track.id) === sourceKey) {
            loadingTracksRef.current.delete(track.id);
          }

          console.error(`Failed to preload track "${track.name}":`, error);
        });
    }
  }, [tracks, preload, retain, release, tonalPadBankPath]);
};
