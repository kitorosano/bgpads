import { useAppConfig } from '../hooks/useAppConfig';
import { t } from '../i18n';

export const SettingsPage = () => {
  const { theme, language, fadeOutDuration, setTheme, setLanguage, setFadeOutDuration } =
    useAppConfig();

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    // Update immediately for UI responsiveness, but could debounce persistence if needed
    setFadeOutDuration(val);
  };

  return (
    <div className="app-container" style={{ padding: '20px', overflowY: 'auto' }}>
      <h2>{t(language, 'settingsTitle')}</h2>

      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label>
          {t(language, 'fadeOutDuration')}: {fadeOutDuration.toFixed(1)}s
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={fadeOutDuration}
          onChange={handleDurationChange}
        />
      </div>

      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label>{t(language, 'theme')}</label>
        <div className="button-group">
          <button
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            {t(language, 'lightMode')}
          </button>
          <button
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            {t(language, 'darkMode')}
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>{t(language, 'language')}</label>
        <div className="button-group">
          <button
            className={`theme-btn ${language === 'es' ? 'active' : ''}`}
            onClick={() => setLanguage('es')}
          >
            Español
          </button>
          <button
            className={`theme-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
};
