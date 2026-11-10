import type { RemoteCommand } from '@bgpads/shared';
import { useI18n } from '../hooks/useI18n';
import type { TranslationKey } from '../i18n';
import type { ConnectionStatus } from '../types';
import { triggerHapticFeedback } from '../utils/haptics';
import { EditIcon } from './icons/EditIcon';
import MetronomeIcon from './icons/MetronomeIcon';
import { MetronomeBeatIndicator } from './MetronomeBeatIndicator';
import './PlaybackHeader.css';

interface Props {
  isEditMode: boolean;
  bpm: number;
  metronomePlaying: boolean;
  currentBeat: number;
  timeSignature: string;
  beatAccents: number[];
  metronomeColor?: string;
  status: ConnectionStatus;
  sendCommand: (command: RemoteCommand) => boolean;
  onToggleEditMode: () => void;
}

export function PlaybackHeader({
  isEditMode,
  bpm,
  metronomePlaying,
  currentBeat,
  timeSignature,
  beatAccents,
  metronomeColor,
  status,
  sendCommand,
  onToggleEditMode
}: Props) {
  const { t } = useI18n();

  const statusKey: Record<ConnectionStatus, TranslationKey> = {
    disconnected: 'statusDisconnected',
    connecting: 'statusConnecting',
    connected: 'statusConnected',
    reconnecting: 'statusReconnecting',
    disconnecting: 'statusDisconnecting'
  };

  const handleOnClick = () => {
    const sent = sendCommand({ type: 'metronome.toggle' });
    if (sent) triggerHapticFeedback();
  };

  return (
    <header className="playback-header">
      <div className="playback-header__brand">
        <strong>{t('appBrand')}</strong>
        <span
          className={`playback-header__connection playback-header__connection--${status}`}
          title={t(statusKey[status])}
          aria-label={`${t('connectionStatus')}: ${t(statusKey[status])}`}
        >
          <span className="playback-header__connection-indicator" />
        </span>
        {status === 'reconnecting' && (
          <span className="playback-header__reconnecting" role="status">
            {t('statusReconnecting')}…
          </span>
        )}
      </div>

      <div className="playback-header__tempo">
        <MetronomeBeatIndicator
          isPlaying={metronomePlaying}
          currentBeat={currentBeat}
          timeSignature={timeSignature}
          beatAccents={beatAccents}
          activeColor={metronomeColor}
        />

        <div className="playback-header__bpm">
          <strong>{bpm}</strong>
          <span>{t('bpm')}</span>
        </div>

        <button
          type="button"
          className={`playback-header__metronome ${
            metronomePlaying ? 'playback-header__metronome--active' : ''
          }`}
          onClick={handleOnClick}
          aria-label={metronomePlaying ? t('stopMetronome') : t('startMetronome')}
          aria-pressed={metronomePlaying}
          disabled={status !== 'connected'}
        >
          <MetronomeIcon />
        </button>
      </div>

      <button
        type="button"
        className={`playback-header__edit ${isEditMode ? 'playback-header__edit--active' : ''}`}
        onClick={onToggleEditMode}
        disabled={status !== 'connected' && !isEditMode}
        aria-label={isEditMode ? 'Finalizar edición' : 'Editar pads'}
        title={isEditMode ? 'Finalizar edición' : 'Editar pads'}
        aria-pressed={isEditMode}
      >
        <EditIcon />
      </button>
    </header>
  );
}
