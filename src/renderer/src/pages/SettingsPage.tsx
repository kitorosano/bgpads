import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useI18n } from '@renderer/hooks/useI18n';
import { CROSSFADE_STEP_INCREMENT } from '../../../constants';

export const SettingsPage = () => {
  const { theme, language, setLanguage, fadeOutDuration, setTheme, setFadeOutDuration } =
    useAppConfig();
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
    </div>
  );
};
