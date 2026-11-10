import type { RemoteCommand, RemoteState } from './remote.js';
import { isRemoteCommand, isRemoteState } from './remoteValidation.js';

export const parseRemoteCommand = (data: string): RemoteCommand | null => {
  try {
    const value: unknown = JSON.parse(data);
    return isRemoteCommand(value) ? value : null;
  } catch {
    return null;
  }
};

export const parseRemoteState = (data: string): RemoteState | null => {
  try {
    const value: unknown = JSON.parse(data);
    return isRemoteState(value) ? value : null;
  } catch {
    return null;
  }
};

export const serializeRemoteCommand = (command: RemoteCommand): string => JSON.stringify(command);

export const serializeRemoteState = (state: RemoteState): string => JSON.stringify(state);
