import { useI18n } from '@renderer/hooks/useI18n';
import packageJson from '../../../../package.json';
import logoImg from '../assets/logo.png';

export const AboutPage = () => {
  const { t } = useI18n();

  return (
    <div className="app-container about-container">
      <div className="about-logo about-logo-container">
        <img src={logoImg} alt="BGPads Logo" width="100" height="100" />
      </div>

      <h2 className="about-title">BGPads</h2>

      <div className="about-info about-info-container">
        <p>
          <strong>{t('version')}:</strong> {packageJson.version}
        </p>
        <p>
          <strong>{t('author')}:</strong> Esteban Rosano
        </p>
        <p>
          <strong>{t('copyright')}:</strong> © {new Date().getFullYear()} Esteban Rosano
        </p>
      </div>

      <p className="about-description about-description-text">{t('description')}</p>
    </div>
  );
};
