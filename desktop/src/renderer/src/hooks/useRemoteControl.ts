import type { RemoteCommand, RemoteTrack, TonalPadKey } from '@bgpads/shared';
import type { AudioTrack } from '@renderer/types';
import { useEffect } from 'react';

interface Props {
  tracks: AudioTrack[];
  playingTrackId: string | null;
  availableTonalKeys: TonalPadKey[];

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

  toggleMetronome: () => void;
  playTrack: (trackId: string) => void;
  stopPlayback: () => void;
  updateRemoteTrack: (trackId: string, changes: Omit<RemoteTrack, 'id'>) => void;
  reorderRemoteTracks: (sourceTrackId: string, targetTrackId: string) => void;
  deleteRemoteTrack: (trackId: string) => void;
  addRemoteTonalTrack: (key: TonalPadKey) => void | Promise<void>;
}

export const useRemoteControl = ({
  tracks,
  playingTrackId,
  availableTonalKeys,
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
  toggleMetronome,
  playTrack,
  stopPlayback,
  updateRemoteTrack,
  reorderRemoteTracks,
  deleteRemoteTrack,
  addRemoteTonalTrack
}: Props) => {
  useEffect(() => {
    const handleCommand = (command: RemoteCommand) => {
      switch (command.type) {
        case 'metronome.toggle':
          toggleMetronome();
          break;

        case 'track.play':
          playTrack(command.trackId);
          break;

        case 'track.stop':
          stopPlayback();
          break;

        case 'track.update':
          updateRemoteTrack(command.trackId, command.changes);
          break;

        case 'track.reorder':
          reorderRemoteTracks(command.sourceTrackId, command.targetTrackId);
          break;

        case 'track.delete':
          deleteRemoteTrack(command.trackId);
          break;

        case 'track.addTonal':
          addRemoteTonalTrack(command.key);
          break;
      }
    };

    return window.api.onRemoteCommand(handleCommand);
  }, [
    stopPlayback,
    toggleMetronome,
    playTrack,
    updateRemoteTrack,
    reorderRemoteTracks,
    deleteRemoteTrack,
    addRemoteTonalTrack
  ]);

  useEffect(() => {
    window.api.updateRemoteState({
      tracks: tracks.map((track) => ({
        id: track.id,
        name: track.name,
        color: track.color,
        volume: track.volume,
        bpm: track.bpm
      })),
      playingTrackId,
      availableTonalKeys,
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
    availableTonalKeys,
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
