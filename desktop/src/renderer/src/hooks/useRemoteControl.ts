import type { RemoteCommand, RemoteState, RemoteTrack, TonalPadKey } from '@bgpads/shared';
import type { AudioTrack } from '@renderer/types';
import { useEffect, useRef } from 'react';

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
  const PROGRESS_SYNC_INTERVAL_MS = 100;

  const lastSyncRef = useRef(0);
  const pendingSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef<RemoteState | null>(null);
  const lastImmediateSignatureRef = useRef<string | null>(null);

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
    const state: RemoteState = {
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
    };

    latestStateRef.current = state;

    const immediateSignature = JSON.stringify({
      tracks: state.tracks,
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
      duration
    });

    const publishState = () => {
      if (pendingSyncRef.current !== null) {
        clearTimeout(pendingSyncRef.current);
        pendingSyncRef.current = null;
      }

      const latestState = latestStateRef.current;
      if (!latestState) return;

      window.api.updateRemoteState(latestState);
      lastSyncRef.current = performance.now();
    };

    // Los cambios importantes se publican inmediatamente.
    if (lastImmediateSignatureRef.current !== immediateSignature) {
      lastImmediateSignatureRef.current = immediateSignature;
      publishState();
      return;
    }

    const elapsed = performance.now() - lastSyncRef.current;

    // El progreso se publica como máximo cada 100 ms.
    if (elapsed >= PROGRESS_SYNC_INTERVAL_MS) {
      publishState();
      return;
    }

    // Conservamos una publicación pendiente con el estado más reciente.
    if (pendingSyncRef.current === null) {
      pendingSyncRef.current = setTimeout(publishState, PROGRESS_SYNC_INTERVAL_MS - elapsed);
    }
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

  useEffect(() => {
    return () => {
      if (pendingSyncRef.current !== null) {
        clearTimeout(pendingSyncRef.current);
        pendingSyncRef.current = null;
      }
    };
  }, []);
};
