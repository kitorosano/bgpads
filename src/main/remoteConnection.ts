import { REMOTE_CONTROL_PORT, REMOTE_PROTOCOL_VERSION } from '../constants';
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

export const createRemoteConnectionPayload = (connectionInfo: RemoteConnectionInfo): string => {
  const params = new URLSearchParams({
    v: String(REMOTE_PROTOCOL_VERSION),
    host: connectionInfo.host,
    port: String(connectionInfo.port)
  });

  return `bgpads://connect?${params.toString()}`;
};
