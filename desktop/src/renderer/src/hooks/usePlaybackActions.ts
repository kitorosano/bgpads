import { AppConfigContextValue } from '@renderer/context/AppConfigContext';
import { useCallback } from 'react';
import { AudioTrack } from '../types';

interface Props {
  tracks: AudioTrack[];
  play: (track: AudioTrack) => void | Promise<void>;
  stop: () => void;
  updateConfig: (updates: Partial<AppConfigContextValue>) => void | Promise<void>;
}

export const usePlaybackActions = ({ tracks, play, stop, updateConfig }: Props) => {
  const applyTrackConfig = useCallback(
    (track: AudioTrack) => {
      updateConfig({
        bpm: track.bpm,
        timeSignature: track.timeSignature,
        metronomeColor: track.color
      });
    },
    [updateConfig]
  );

  const playTrack = useCallback(
    (trackId: string) => {
      const track = tracks.find((track) => track.id === trackId);
      if (!track) return;

      applyTrackConfig(track);
      play(track);
    },
    [tracks, applyTrackConfig, play]
  );

  const stopPlayback = useCallback(() => {
    stop();
  }, [stop]);

  return {
    playTrack,
    stopPlayback,
    applyTrackConfig
  };
};
