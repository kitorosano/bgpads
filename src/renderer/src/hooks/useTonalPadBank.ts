import { useEffect, useState } from 'react';
import type { TonalPadBankValidation } from '../../../types';
import { useAppConfig } from './useAppConfig';

export const useTonalPadBank = () => {
  const { tonalPadBankPath, setTonalPadBankPath } = useAppConfig();

  const [validation, setValidation] = useState<TonalPadBankValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!tonalPadBankPath) {
      setValidation(null);
      return;
    }

    let cancelled = false;

    const validate = async () => {
      setIsValidating(true);

      try {
        const result = await window.api.validateTonalPadBank(tonalPadBankPath);

        if (!cancelled) setValidation(result);
      } catch (error) {
        console.error('Failed to validate tonal pad bank:', error);

        if (!cancelled) setValidation(null);
      } finally {
        if (!cancelled) setIsValidating(false);
      }
    };

    validate();

    return () => {
      cancelled = true;
    };
  }, [tonalPadBankPath]);

  const selectBank = async () => {
    const result = await window.api.selectTonalPadBank();
    if (!result) return;

    setValidation(result);
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
