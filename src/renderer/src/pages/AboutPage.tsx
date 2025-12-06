import { useI18n } from '@renderer/hooks/useI18n';
import packageJson from '../../../../package.json';
import logoImg from '../assets/logo.png';

export const AboutPage = () => {
  const { t } = useI18n();

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
          <strong>{t('version')}:</strong> {packageJson.version}
        </p>
        <p>
          <strong>{t('author')}:</strong> Esteban Rosano
        </p>
        <p>
          <strong>{t('copyright')}:</strong> © {new Date().getFullYear()} Esteban Rosano
        </p>
      </div>

      <p className="about-description" style={{ maxWidth: '400px' }}>
        {t('description')}
      </p>
    </div>
  );
};
