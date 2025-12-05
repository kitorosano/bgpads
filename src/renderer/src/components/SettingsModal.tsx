import { Language, t } from '../i18n';

interface SettingsModalProps {
  fadeOutDuration: number;
  setFadeOutDuration: (duration: number) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onClose: () => void;
}

export const SettingsModal = ({
  fadeOutDuration,
  setFadeOutDuration,
  theme,
  setTheme,
  language,
  setLanguage,
  onClose
}: SettingsModalProps) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFadeOutDuration(parseFloat(e.target.value));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings" onClick={(e) => e.stopPropagation()}>
        <h2>{t(language, 'settingsTitle')}</h2>

        <div className="control-group">
          <label>
            {t(language, 'fadeOutDuration')}: {fadeOutDuration.toFixed(1)}s
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={fadeOutDuration}
            onChange={handleSliderChange}
          />
        </div>

        <div className="control-group">
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

        <button className="close-btn" onClick={onClose}>
          {t(language, 'close')}
        </button>
      </div>
    </div>
  );
};
