import type { AudioTrack } from '@renderer/types';
import { useEffect } from 'react';
import type { RemoteCommand } from '../../../types';

interface Props {
  tracks: AudioTrack[];
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

  playTrack: (trackId: string) => void;
  stopPlayback: () => void;
  toggleMetronome: () => void;
}

export const useRemoteControl = ({
  tracks,
  playingTrackId,
  fadingOutTrackId,
  fadeOutDuration,
  fadeOutStartedAt,
  bpm,
  metronomePlaying,
  currentBeat,
  timeSignature,
  beatAccents,
  playbackProgress,
  currentTime,
  duration,
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
      fadeOutDuration,
      fadeOutStartedAt,
      bpm,
      metronomePlaying,
      currentBeat,
      timeSignature,
      beatAccents,
      playbackProgress,
      currentTime,
      duration
    });
  }, [
    tracks,
    playingTrackId,
    fadingOutTrackId,
    fadeOutDuration,
    fadeOutStartedAt,
    bpm,
    metronomePlaying,
    currentBeat,
    timeSignature,
    beatAccents,
    playbackProgress,
    currentTime,
    duration
  ]);
};
