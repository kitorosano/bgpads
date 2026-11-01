import { hostname } from 'os';
import { REMOTE_CONTROL_PORT } from '../constants';
import type { RemoteConnectionInfo } from '../types';
import { getPreferredLanAddress } from './network';

export const getRemoteConnectionInfo = (): RemoteConnectionInfo | null => {
  const networkAddress = getPreferredLanAddress();
  if (!networkAddress) return null;

  return {
    host: networkAddress.address,
    port: REMOTE_CONTROL_PORT,
    interfaceName: networkAddress.name
  };
};

export const createRemoteConnectionPayload = (): string => {
  const localHostname = hostname();

  return `http://${localHostname}.local:${REMOTE_CONTROL_PORT}`;
};
