import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useI18n } from '@renderer/hooks/useI18n';
import { useTonalPadBank } from '@renderer/hooks/useTonalPadBank';
import { CROSSFADE_STEP_INCREMENT } from '../../../constants';

export const PadSettingsSection = () => {
  const { t } = useI18n();
  const {
    fadeOutDuration,
    setFadeOutDuration,
    autoAssignPositionBasedShortcuts,
    setAutoAssignPositionBasedShortcuts
  } = useAppConfig();

  const {
    tonalPadBankPath,
    validation: tonalBankValidation,
    isValidating,
    selectBank
  } = useTonalPadBank();

  return (
    <>
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
        <label style={{ margin: 0 }}>{t('autoAssignPositionBasedShortcuts')}</label>
        <input
          type="checkbox"
          checked={!!autoAssignPositionBasedShortcuts}
          onChange={(e) => setAutoAssignPositionBasedShortcuts(e.target.checked)}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
      </div>

      <div>
        <h3>Tonal Pad Bank</h3>

        <p>{tonalPadBankPath ?? 'No tonal pad bank selected'}</p>
        {isValidating && <p>Validating...</p>}

        <button onClick={selectBank}>Select folder</button>

        <div>
          {/* {tonalBankValidation?.availableKeys && tonalBankValidation.availableKeys.length > 0 && (
            <p>Available: {tonalBankValidation.availableKeys.join(' - ') || 'None'}</p>
          )} */}

          {tonalBankValidation?.missingKeys && tonalBankValidation.missingKeys.length > 0 && (
            <p>Missing: {tonalBankValidation.missingKeys.join(' - ') || 'None'}</p>
          )}
        </div>
      </div>
    </>
  );
};

export const PadSettingsPage = () => {
  const { t } = useI18n();

  return (
    <div className="app-container" style={{ padding: '20px', overflowY: 'auto' }}>
      <h2>{t('padsSettings')}</h2>

      <PadSettingsSection />
    </div>
  );
};
