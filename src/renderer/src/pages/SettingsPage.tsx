import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useI18n } from '@renderer/hooks/useI18n';
import { CROSSFADE_STEP_INCREMENT } from '../../../constants';

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
        <h3>Metronome</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <label>BPM:</label>
              <input
                type="number"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) =>
                  setBpm(Math.max(40, Math.min(240, parseInt(e.target.value) || 120)))
                }
                style={{
                  width: '60px',
                  padding: '5px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  background: '#222',
                  color: '#fff',
                  textAlign: 'center'
                }}
              />
            </div>
            <input
              type="range"
              min="40"
              max="240"
              step="1"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Shortcut (Start/Stop):{' '}
              {metronomeShortcut ? (
                <span className="key-tag">{metronomeShortcut}</span>
              ) : (
                <span style={{ opacity: 0.5 }}>None</span>
              )}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="theme-btn"
                onClick={() => {
                  const handler = (e: KeyboardEvent) => {
                    e.preventDefault();
                    const key = e.key.toUpperCase();
                    // Avoid modifiers alone
                    if (['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)) return;
                    setMetronomeShortcut(key);
                    window.removeEventListener('keydown', handler);
                  };
                  window.addEventListener('keydown', handler);
                }}
              >
                Record Shortcut
              </button>
              {metronomeShortcut && (
                <button
                  className="theme-btn"
                  style={{ background: '#e74c3c' }}
                  onClick={() => setMetronomeShortcut(null)}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
