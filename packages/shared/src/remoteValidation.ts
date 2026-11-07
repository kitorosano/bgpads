import type { RemoteCommand } from './remote.js';
import { TONAL_PAD_KEYS } from './tonalPad.js';
import { isValidBpm, isValidColor, isValidText, isValidVolume } from './validation.js';

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
        isValidText(command.sourceTrackId) &&
        command.sourceTrackId !== command.targetTrackId
      );

    case 'track.delete':
      return isValidText(command.trackId);

    case 'track.addTonal':
      return (
        isValidText(command.key) && (TONAL_PAD_KEYS as readonly string[]).includes(command.key)
      );

    default:
      return false;
  }
};
