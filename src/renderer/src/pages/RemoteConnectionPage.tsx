import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import type { RemoteConnectionInfo } from '../../../types';

export const RemoteConnectionPage = () => {
  const [connectionInfo, setConnectionInfo] = useState<RemoteConnectionInfo | null>(null);

  const [connectionPayload, setConnectionPayload] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      window.api.getRemoteConnectionInfo(),
      window.api.getRemoteConnectionPayload()
    ]).then(([info, payload]) => {
      setConnectionInfo(info);
      setConnectionPayload(payload);
    });
  }, []);

  return (
    <div>
      <h1>BGPads Remote</h1>

      {connectionInfo && connectionPayload ? (
        <>
          <p>Scan this QR code with your phone to open BGPads Remote.</p>

          <QRCodeSVG value={connectionPayload} size={220} level="M" />

          <p>
            <strong>{connectionPayload}</strong>
          </p>

          <p>
            {connectionInfo.interfaceName} · {connectionInfo.host}:{connectionInfo.port}
          </p>
        </>
      ) : (
        <p>No local network connection found.</p>
      )}
    </div>
  );
};
