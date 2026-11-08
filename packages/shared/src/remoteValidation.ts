import type { RemoteCommand } from './remote.js';
import {
  isValidBpm,
  isValidColor,
  isValidNumber,
  isValidText,
  isValidTonalKey,
  isValidTrack,
  isValidVolume
} from './validation.js';

import type { RemoteState } from './remote.js';

export const isRemoteState = (value: unknown): value is RemoteState => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const state = value as Record<string, unknown>;

  // TODO: refactor this ?
  return (
    Array.isArray(state.tracks) &&
    state.tracks.every(isValidTrack) &&
    (state.playingTrackId === null || typeof state.playingTrackId === 'string') &&
    Array.isArray(state.availableTonalKeys) &&
    state.availableTonalKeys.every(isValidTonalKey) &&
    (state.fadingOutTrackId === null || typeof state.fadingOutTrackId === 'string') &&
    isValidNumber(state.fadeOutDuration) &&
    (state.fadeOutStartedAt === null || isValidNumber(state.fadeOutStartedAt)) &&
    isValidBpm(state.bpm) &&
    typeof state.metronomePlaying === 'boolean' &&
    Number.isInteger(state.currentBeat) &&
    typeof state.timeSignature === 'string' &&
    Array.isArray(state.beatAccents) &&
    state.beatAccents.every(isValidNumber) &&
    isValidNumber(state.playbackProgress) &&
    isValidNumber(state.currentTime) &&
    isValidNumber(state.duration)
  );
};

export const isRemoteCommand = (value: unknown): value is RemoteCommand => {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }

  const command = value as Record<string, unknown>;

  switch (command.type) {
    case 'metronome.toggle':
      return true;

    case 'track.play':
      return isValidText(command.trackId);

    case 'track.stop':
      return true;

    case 'track.update': {
      if (
        typeof command.trackId !== 'string' ||
        typeof command.changes !== 'object' ||
        command.changes === null
      ) {
        return false;
      }

      const changes = command.changes as Record<string, unknown>;

      return (
        isValidText(changes.name) &&
        isValidColor(changes.color) &&
        isValidVolume(changes.volume) &&
        isValidBpm(changes.bpm)
      );
    }

    case 'track.reorder':
      return (
        isValidText(command.sourceTrackId) &&
        isValidText(command.targetTrackId) &&
        command.sourceTrackId !== command.targetTrackId
      );

    case 'track.delete':
      return isValidText(command.trackId);

    case 'track.addTonal':
      return isValidTonalKey(command.key);

    default:
      return false;
  }
};
