import AppConfigContext, { AppConfigContextValue } from '@renderer/context/AppConfigContext';
import { useContext } from 'react';

export const useAppConfig = (): AppConfigContextValue => {
  const context = useContext(AppConfigContext);

  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }

  return context;
};
