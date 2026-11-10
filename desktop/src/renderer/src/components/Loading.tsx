import { useI18n } from '@renderer/hooks/useI18n';
import { useEffect, useState } from 'react';
import logoImg from '../assets/logo.png';

export const Loading = () => {
  const { t } = useI18n();
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => (prevCounter + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="app-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--text-color)'
      }}
    >
      <div className="loading-container">
        <img src={logoImg} alt="BGPads Logo" width="150" height="150" />
        <p>
          {t('loading')}
          {'.'.repeat(counter)}
        </p>
      </div>
    </div>
  );
};
