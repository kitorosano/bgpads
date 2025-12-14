import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useI18n } from '@renderer/hooks/useI18n';

export const SettingsPage = () => {
  const { theme, language, setLanguage, setTheme } = useAppConfig();
  const { t } = useI18n();

  const isLightTheme = theme === 'light';
  const isEnglish = language === 'en';

  return (
    <div className="app-container" style={{ padding: '20px', overflowY: 'auto' }}>
      <h2>{t('preferences')}</h2>

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

      <div className="control-group" style={{ marginBottom: '20px' }}>
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
