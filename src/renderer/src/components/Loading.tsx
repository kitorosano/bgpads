import { useI18n } from '@renderer/hooks/useI18n';

export const Loading = () => {
  const { t } = useI18n();

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
      <div style={{ textAlign: 'center' }}>
        <p>{t('loading')}</p>
        <div
          className="spinner"
          style={{
            margin: '20px auto',
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            borderTop: '4px solid var(--primary-color)',
            animation: 'spin 1s linear infinite'
          }}
        ></div>
        <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
      </div>
    </div>
  );
};
