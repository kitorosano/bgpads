import { useEffect, useState } from 'react';
import packageJson from '../../../../package.json';
import logoImg from '../assets/logo.png';
import { t } from '../i18n';
import { Language, Theme } from '../types';

export const AboutPage = () => {
  const [language, setLanguage] = useState<Language>('es');
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const init = async () => {
      const config = await window.api.loadConfig();
      if (config) {
        if (config.language) setLanguage(config.language);
        if (config.theme) setTheme(config.theme);
      }
    };
    init();
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div
      className="app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <div className="about-logo" style={{ marginBottom: '20px' }}>
        <img src={logoImg} alt="BGPads Logo" width="100" height="100" />
      </div>

      <h2 style={{ marginBottom: '20px' }}>BGPads</h2>

      <div
        className="about-info"
        style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}
      >
        <p>
          <strong>{t(language, 'version')}:</strong> {packageJson.version}
        </p>
        <p>
          <strong>{t(language, 'author')}:</strong> Esteban Rosano
        </p>
        <p>
          <strong>{t(language, 'copyright')}:</strong> © {new Date().getFullYear()} Esteban Rosano
        </p>
      </div>

      <p className="about-description" style={{ maxWidth: '400px' }}>
        {t(language, 'description')}
      </p>
    </div>
  );
};
