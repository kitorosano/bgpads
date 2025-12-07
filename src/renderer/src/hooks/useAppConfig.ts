import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_BPM,
  DEFAULT_CROSSFADE_DURATION,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME
} from '../../../constants';
import { Language, Theme } from '../../../types';

export const useAppConfig = () => {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [fadeOutDuration, setFadeOutDuration] = useState(DEFAULT_CROSSFADE_DURATION);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [metronomeShortcut, setMetronomeShortcut] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const config = await window.api.loadConfig();
      if (config) {
        if (config.theme) setTheme(config.theme);
        if (config.language) setLanguage(config.language);
        if (config.fadeOutDuration) setFadeOutDuration(config.fadeOutDuration);
        if (config.bpm) setBpm(config.bpm);
        if (config.metronomeShortcut) setMetronomeShortcut(config.metronomeShortcut);
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
        if (newConfig.bpm) setBpm(newConfig.bpm);
        if (newConfig.metronomeShortcut) setMetronomeShortcut(newConfig.metronomeShortcut);
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
    if (updates.bpm) setBpm(updates.bpm);
    if (updates.metronomeShortcut) setMetronomeShortcut(updates.metronomeShortcut);
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
    bpm,
    metronomeShortcut,
    isLoaded,
    updateConfig,
    setTheme: (t: Theme) => updateConfig({ theme: t }),
    setLanguage: (l: Language) => updateConfig({ language: l }),
    setFadeOutDuration: (d: number) => updateConfig({ fadeOutDuration: d }),
    setBpm: (b: number) => updateConfig({ bpm: b }),
    setMetronomeShortcut: (s: string | null) => updateConfig({ metronomeShortcut: s }),
    setTracks: (t: any[]) => updateConfig({ tracks: t })
  };
};
