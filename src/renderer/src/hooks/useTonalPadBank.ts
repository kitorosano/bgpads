import { useEffect, useState } from 'react';
import { BANK_VALIDATION_INTERVAL_MS } from '../../../constants';
import type { TonalPadBankValidation } from '../../../types';
import { useAppConfig } from './useAppConfig';

export const useTonalPadBank = () => {
  const { tonalPadBankPath, setTonalPadBankPath } = useAppConfig();

  const [validation, setValidation] = useState<TonalPadBankValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!tonalPadBankPath) {
      setValidation(null);
      setIsValidating(false);
      return;
    }

    let cancelled = false;
    let validating = false;

    // Evita mostrar resultados de un banco anterior.
    setValidation(null);
    setIsValidating(true);

    const validate = async () => {
      if (validating || cancelled) return;

      validating = true;

      try {
        const result = await window.api.validateTonalPadBank(tonalPadBankPath);
        if (cancelled) return;

        setValidation((previous) => {
          if (
            previous?.path === result.path &&
            previous.availableKeys.join(',') === result.availableKeys.join(',') &&
            previous.missingKeys.join(',') === result.missingKeys.join(',')
          ) {
            return previous;
          }

          return result;
        });
      } catch (error) {
        if (!cancelled) {
          console.error('[TonalPadBank] Validation failed:', error);

          setValidation(null);
        }
      } finally {
        validating = false;

        if (!cancelled) {
          setIsValidating(false);
        }
      }
    };

    validate();

    const intervalId = window.setInterval(() => {
      validate();
    }, BANK_VALIDATION_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [tonalPadBankPath]);

  const selectBank = async () => {
    const result = await window.api.selectTonalPadBank();
    if (!result) return;

    setTonalPadBankPath(result.path);
  };

  return {
    tonalPadBankPath,
    validation,
    isConfigured: Boolean(tonalPadBankPath),
    isValidating,
    selectBank
  };
};
