import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useI18n } from '@renderer/hooks/useI18n';
import {
  DEFAULT_METRONOME_VOLUME,
  MAX_METRONOME_VOLUME,
  METRONOME_VOLUME_STEP_INCREMENT,
  MIN_METRONOME_VOLUME,
  SHORTCUT_KEYS_TO_IGNORE
} from '../../../constants';

export const MetronomeSettingsPage = () => {
  const { t } = useI18n();
  const {
    metronomeShortcut,
    setMetronomeShortcut,
    metronomeFrequency,
    setMetronomeFrequency,
    metronomeDecay,
    setMetronomeDecay,
    metronomeHarmonicCount,
    setMetronomeHarmonicCount,
    metronomeVolume,
    setMetronomeVolume
  } = useAppConfig();

  return (
    <div className="app-container" style={{ padding: '20px', overflowY: 'auto' }}>
      <h2>{t('metronomeSettings')}</h2>

      {/* BPM Configuration */}

      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label>
          {t('volume')}: {Math.round((metronomeVolume ?? DEFAULT_METRONOME_VOLUME) * 100)}%
        </label>
        <input
          type="range"
          min={MIN_METRONOME_VOLUME}
          max={MAX_METRONOME_VOLUME}
          step={METRONOME_VOLUME_STEP_INCREMENT}
          value={metronomeVolume ?? DEFAULT_METRONOME_VOLUME}
          onChange={(e) => setMetronomeVolume(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Shortcut Configuration */}
      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label className="shortcut-label">
          {t('metronomeShortcut')}:{' '}
          {metronomeShortcut ? (
            <span className="key-tag">{metronomeShortcut}</span>
          ) : (
            <span className="placeholder-text">{t('none')}</span>
          )}
        </label>
        <div className="shortcut-buttons">
          <button
            className="theme-btn"
            onClick={() => {
              const handler = (e: KeyboardEvent) => {
                e.preventDefault();
                const key = e.key.toUpperCase();
                if (SHORTCUT_KEYS_TO_IGNORE.includes(key)) return;
                setMetronomeShortcut(key);
                window.removeEventListener('keydown', handler);
              };
              window.addEventListener('keydown', handler);
            }}
          >
            {t('recordShortcut')}
          </button>
          {metronomeShortcut && (
            <button className="theme-btn danger-btn" onClick={() => setMetronomeShortcut(null)}>
              {t('clearShortcut')}
            </button>
          )}
        </div>
      </div>

      <hr style={{ opacity: 0.2, margin: '20px 0' }} />

      {/* Sound Customization */}
      <h3>{t('soundCustomization')}</h3>

      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label>
          {t('frequency')}: {metronomeFrequency} Hz
        </label>
        <input
          type="range"
          min="200"
          max="2000"
          step="50"
          value={metronomeFrequency}
          onChange={(e) => setMetronomeFrequency(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label>
          {t('decay')}: {metronomeDecay?.toFixed(2)} s
        </label>
        <input
          type="range"
          min="0.01"
          max="0.5"
          step="0.01"
          value={metronomeDecay}
          onChange={(e) => setMetronomeDecay(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label>
          {t('harmonics')}: {metronomeHarmonicCount}
        </label>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={metronomeHarmonicCount}
          onChange={(e) => setMetronomeHarmonicCount(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};
