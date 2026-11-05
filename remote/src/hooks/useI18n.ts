import { useCallback } from 'react';
import { translations, type TranslationKey } from '../i18n';

export const useI18n = () => {
  const t = useCallback(
    (key: TranslationKey): string => {
      return translations.en[key];
    },
    []
  );

  return { t };
};
