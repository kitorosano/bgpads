import type { AudioTrack } from '@renderer/types';
import { useEffect } from 'react';
import type { RemoteCommand } from '../../../types';

interface Props {
  tracks: AudioTrack[];
  playingTrackId: string | null;
  fadingOutTrackId: string | null;
  bpm: number;
  metronomePlaying: boolean;

  playTrack: (trackId: string) => void;
  stopPlayback: () => void;
  toggleMetronome: () => void;
}

export const useRemoteControl = ({
  tracks,
  playingTrackId,
  fadingOutTrackId,
  bpm,
  metronomePlaying,
  playTrack,
  stopPlayback,
  toggleMetronome
}: Props) => {
  useEffect(() => {
    const handleCommand = (command: RemoteCommand) => {
      switch (command.type) {
        case 'track.play':
          playTrack(command.trackId);
          break;

        case 'track.stop':
          stopPlayback();
          break;

        case 'metronome.toggle':
          toggleMetronome();
          break;
      }
    };

    return window.api.onRemoteCommand(handleCommand);
  }, [playTrack, stopPlayback, toggleMetronome]);

  useEffect(() => {
    window.api.updateRemoteState({
      tracks: tracks.map((track) => ({
        id: track.id,
        name: track.name,
        color: track.color
      })),
      playingTrackId,
      fadingOutTrackId,
      bpm,
      metronomePlaying
    });
  }, [tracks, playingTrackId, fadingOutTrackId, bpm, metronomePlaying]);
};
