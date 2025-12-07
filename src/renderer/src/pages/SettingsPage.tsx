import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useI18n } from '@renderer/hooks/useI18n';
import {
  CROSSFADE_STEP_INCREMENT,
  MAX_BPM,
  MIN_BPM,
  SHORTCUT_KEYS_TO_IGNORE
} from '../../../constants';
import { clampBpm } from '../utils/validationUtils';

export const SettingsPage = () => {
  const {
    theme,
    language,
    setLanguage,
    fadeOutDuration,
    setTheme,
    setFadeOutDuration,
    bpm,
    setBpm,
    metronomeShortcut,
    setMetronomeShortcut
  } = useAppConfig();
  const { t } = useI18n();

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    // Update immediately for UI responsiveness, but could debounce persistence if needed
    setFadeOutDuration(val);
  };

  const isLightTheme = theme === 'light';
  const isEnglish = language === 'en';

  return (
    <div className="app-container" style={{ padding: '20px', overflowY: 'auto' }}>
      <h2>{t('settingsTitle')}</h2>

      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label>
          {t('fadeOutDuration')}: {fadeOutDuration.toFixed(1)}s
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step={CROSSFADE_STEP_INCREMENT}
          value={fadeOutDuration}
          onChange={handleDurationChange}
        />
      </div>

      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label>{t('theme')}</label>
        <div className="button-group">
          <button
            className={`theme-btn ${isLightTheme ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            {t('lightMode')}
          </button>
          <button
            className={`theme-btn ${!isLightTheme ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            {t('darkMode')}
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>{t('language')}</label>
        <div className="button-group">
          <button
            className={`theme-btn ${!isEnglish ? 'active' : ''}`}
            onClick={() => setLanguage('es')}
          >
            Español
          </button>
          <button
            className={`theme-btn ${isEnglish ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
        </div>
      </div>

      <div className="control-group" style={{ marginTop: '20px' }}>
        <label>{t('metronome')}</label>
        <div className="settings-grid">
          <div>
            <div className="bpm-input-group">
              <label>BPM:</label>
              <input
                type="number"
                min={MIN_BPM}
                max={MAX_BPM}
                value={bpm}
                onChange={(e) => setBpm(clampBpm(e.target.value))}
                className="bpm-number-input"
              />
            </div>
            <input
              type="range"
              min={MIN_BPM}
              max={MAX_BPM}
              step="1"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-full"
              style={{ width: '100%' }}
            />
          </div>
          <div>
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
                    // Avoid modifiers alone
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
        </div>
      </div>
    </div>
  );
};
