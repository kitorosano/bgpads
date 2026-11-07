import { useCallback } from 'react';
import { translations } from '../../../i18n';
import { useAppConfig } from './useAppConfig';

export const useI18n = () => {
  const { language } = useAppConfig();

  const t = useCallback(
    (key: keyof typeof translations.en): string => {
      return translations[language][key];
    },
    [language]
  );

  return { t };
};
