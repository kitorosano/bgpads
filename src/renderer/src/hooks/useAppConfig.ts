import { useCallback, useEffect, useState } from 'react';
import { Language, Theme } from '../../../types';

export const useAppConfig = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('es');
  const [fadeOutDuration, setFadeOutDuration] = useState(2);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const config = await window.api.loadConfig();
      if (config) {
        if (config.theme) setTheme(config.theme);
        if (config.language) setLanguage(config.language);
        if (config.fadeOutDuration) setFadeOutDuration(config.fadeOutDuration);
        if (config.tracks) setTracks(config.tracks);
      }
      setIsLoaded(true);
    };
    init();

    // Listen for settings changes from other windows
    const removeSettingsChangedListener = window.electron.ipcRenderer.on(
      'settings-changed',
      (_event, newConfig) => {
        if (newConfig.theme) setTheme(newConfig.theme);
        if (newConfig.language) setLanguage(newConfig.language);
        if (newConfig.fadeOutDuration) setFadeOutDuration(newConfig.fadeOutDuration);
        if (newConfig.tracks) setTracks(newConfig.tracks);
      }
    );

    return () => {
      if (typeof removeSettingsChangedListener === 'function') {
        removeSettingsChangedListener();
      } else if (
        removeSettingsChangedListener &&
        'removeAllListeners' in removeSettingsChangedListener
      ) {
        // Fallback if it returns the emitter
        removeSettingsChangedListener.removeAllListeners('settings-changed');
      }
    };
  }, []);

  // Apply theme globally
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const updateConfig = useCallback(async (updates: any) => {
    // Optimistic update
    if (updates.theme) setTheme(updates.theme);
    if (updates.language) setLanguage(updates.language);
    if (updates.fadeOutDuration) setFadeOutDuration(updates.fadeOutDuration);
    if (updates.tracks) setTracks(updates.tracks);

    const config = await window.api.loadConfig();
    const newConfig = { ...config, ...updates };
    await window.api.saveConfig(newConfig);

    // Notify main process to broadcast to other windows
    window.electron.ipcRenderer.invoke('broadcast-settings-change', newConfig);
  }, []);

  return {
    theme,
    language,
    fadeOutDuration,
    tracks,
    isLoaded,
    updateConfig,
    setTheme: (t: Theme) => updateConfig({ theme: t }),
    setLanguage: (l: Language) => updateConfig({ language: l }),
    setFadeOutDuration: (d: number) => updateConfig({ fadeOutDuration: d }),
    setTracks: (t: any[]) => updateConfig({ tracks: t })
  };
};
