import { useEffect } from 'react';
import type { RemoteCommand } from '../../../types';

interface Props {
  playTrack: (trackId: string) => void;
  stopPlayback: () => void;
  toggleMetronome: () => void;
}

export const useRemoteControl = ({ playTrack, stopPlayback, toggleMetronome }: Props) => {
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
};
