import packageJson from '../../../../package.json';
import logoImg from '../assets/logo.png';
import { Language, t } from '../i18n';

interface AboutModalProps {
  language: Language;
  onClose: () => void;
}

export const AboutModal = ({ language, onClose }: AboutModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content about" onClick={(e) => e.stopPropagation()}>
        <div className="about-header">
          <div className="about-logo">
            <img src={logoImg} alt="BGPads Logo" width="100" height="100" />
          </div>
        </div>

        <div className="about-info">
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

        <p className="about-description">{t(language, 'description')}</p>

        <button className="close-btn" onClick={onClose}>
          {t(language, 'close')}
        </button>
      </div>
    </div>
  );
};
