import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { TranslationKey } from '../i18n';
import type { ConnectionStatus } from '../types';
import './ConnectionScreen.css';

interface Props {
  status: ConnectionStatus;
  lastHost: string;
  connect: (host: string) => void;
  disconnect: () => void;
}

export function ConnectionScreen({ status, lastHost, connect, disconnect }: Props) {
  const { t } = useI18n();

  const [host, setHost] = useState(lastHost);

  const hasActiveConnection =
    status === 'connecting' ||
    status === 'connected' ||
    status === 'reconnecting' ||
    status === 'disconnecting';

  const statusKey: Record<ConnectionStatus, TranslationKey> = {
    disconnected: 'statusDisconnected',
    connecting: 'statusConnecting',
    connected: 'statusConnected',
    reconnecting: 'statusReconnecting',
    disconnecting: 'statusDisconnecting'
  };

  return (
    <main className="app app--connection">
      <section className="connection">
        <header className="connection__header">
          <h1>{t('appTitle')}</h1>
          <p>{t('appSubtitle')}</p>
        </header>

        <div className="connection__status">
          <span className="connection__status-indicator" />
          <span>{t(statusKey[status])}</span>
        </div>

        <div className="connection__form">
          <input
            type="text"
            value={host}
            onChange={(event) => setHost(event.target.value)}
            disabled={hasActiveConnection}
            placeholder={t('desktopIpPlaceholder')}
          />

          {hasActiveConnection ? (
            <button onClick={disconnect} disabled={status === 'disconnecting'}>
              {status === 'disconnecting' ? t('disconnecting') : t('disconnect')}
            </button>
          ) : (
            <button onClick={() => connect(host)} disabled={!host.trim()}>
              {t('connect')}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
