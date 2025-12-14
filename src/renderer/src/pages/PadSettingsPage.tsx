import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useI18n } from '@renderer/hooks/useI18n';
import { CROSSFADE_STEP_INCREMENT } from '../../../constants';

export const PadSettingsPage = () => {
  const { t } = useI18n();
  const { fadeOutDuration, setFadeOutDuration, autoAssignShortcuts, setAutoAssignShortcuts } =
    useAppConfig();

  return (
    <div className="app-container" style={{ padding: '20px', overflowY: 'auto' }}>
      <h2>{t('padsSettings')}</h2>

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
          onChange={(e) => setFadeOutDuration(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div
        className="control-group"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <label style={{ margin: 0 }}>{t('autoAssignShortcuts')}</label>
        <input
          type="checkbox"
          checked={!!autoAssignShortcuts}
          onChange={(e) => setAutoAssignShortcuts(e.target.checked)}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};
