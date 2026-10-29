import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useI18n } from '@renderer/hooks/useI18n';
import { useEffect, useState } from 'react';
import { CROSSFADE_STEP_INCREMENT } from '../../../constants';
import { TonalPadBankValidation } from '../../../types';

export const PadSettingsSection = () => {
  const { t } = useI18n();
  const {
    fadeOutDuration,
    setFadeOutDuration,
    autoAssignShortcuts,
    setAutoAssignShortcuts,
    tonalPadBankPath,
    setTonalPadBankPath
  } = useAppConfig();
  const [tonalBankValidation, setTonalBankValidation] = useState<TonalPadBankValidation | null>(
    null
  );

  useEffect(() => {
    if (!tonalPadBankPath) {
      setTonalBankValidation(null);
      return;
    }

    let cancelled = false;

    const validateBank = async () => {
      try {
        const result = await window.api.validateTonalPadBank(tonalPadBankPath);

        if (!cancelled) setTonalBankValidation(result);
      } catch (error) {
        console.error('Failed to validate tonal pad bank:', error);

        if (!cancelled) setTonalBankValidation(null);
      }
    };

    void validateBank();

    return () => {
      cancelled = true;
    };
  }, [tonalPadBankPath]);

  const handleSelectTonalPadBank = async () => {
    try {
      const result = await window.api.selectTonalPadBank();
      if (!result) return;

      setTonalBankValidation(result);
      setTonalPadBankPath(result.path);
    } catch (error) {
      console.error('Failed to select tonal pad bank:', error);
    }
  };

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
        <label style={{ margin: 0 }}>{t('autoAssignShortcuts')}</label>
        <input
          type="checkbox"
          checked={!!autoAssignShortcuts}
          onChange={(e) => setAutoAssignShortcuts(e.target.checked)}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
      </div>

      <div>
        <h3>Tonal Pad Bank</h3>

        <p>{tonalPadBankPath ?? 'No tonal pad bank selected'}</p>

        <button onClick={handleSelectTonalPadBank}>Select folder</button>

        {tonalBankValidation && (
          <div>
            <p>Available: {tonalBankValidation.availableKeys.join(', ') || 'None'}</p>

            <p>Missing: {tonalBankValidation.missingKeys.join(', ') || 'None'}</p>
          </div>
        )}
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
