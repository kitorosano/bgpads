import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_BEAT_ACCENTS,
  DEFAULT_BPM,
  DEFAULT_CROSSFADE_DURATION,
  DEFAULT_LANGUAGE,
  DEFAULT_METRONOME_ACCENT_DECAY,
  DEFAULT_METRONOME_ACCENT_FREQUENCY,
  DEFAULT_METRONOME_ACCENT_HARMONIC_COUNT,
  DEFAULT_METRONOME_DECAY,
  DEFAULT_METRONOME_FREQUENCY,
  DEFAULT_METRONOME_HARMONIC_COUNT,
  DEFAULT_METRONOME_TIME_SIGNATURE,
  DEFAULT_METRONOME_VOLUME,
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
  const [metronomeFrequency, setMetronomeFrequency] = useState(DEFAULT_METRONOME_FREQUENCY);
  const [metronomeDecay, setMetronomeDecay] = useState(DEFAULT_METRONOME_DECAY);
  const [metronomeHarmonicCount, setMetronomeHarmonicCount] = useState(
    DEFAULT_METRONOME_HARMONIC_COUNT
  );
  const [autoAssignShortcuts, setAutoAssignShortcuts] = useState(false);
  const [tracksOutputDeviceId, setTracksOutputDeviceId] = useState<string>('default');
  const [metronomeOutputDeviceId, setMetronomeOutputDeviceId] = useState<string>('default');
  const [timeSignature, setTimeSignature] = useState<string>(DEFAULT_METRONOME_TIME_SIGNATURE);
  const [metronomeColor, setMetronomeColor] = useState<string>('var(--accent-color)');
  const [metronomeVolume, setMetronomeVolume] = useState(DEFAULT_METRONOME_VOLUME);
  const [metronomeAccentFrequency, setMetronomeAccentFrequency] = useState(
    DEFAULT_METRONOME_ACCENT_FREQUENCY
  );
  const [metronomeAccentDecay, setMetronomeAccentDecay] = useState(DEFAULT_METRONOME_ACCENT_DECAY);
  const [metronomeAccentHarmonicCount, setMetronomeAccentHarmonicCount] = useState(
    DEFAULT_METRONOME_ACCENT_HARMONIC_COUNT
  );
  const [beatAccents, setBeatAccents] = useState<number[]>(DEFAULT_BEAT_ACCENTS);

  useEffect(() => {
    const init = async () => {
      const config = await window.api.loadConfig();
      if (config) {
        if (config.theme) setTheme(config.theme);
        if (config.language) setLanguage(config.language);
        if (config.fadeOutDuration) setFadeOutDuration(config.fadeOutDuration);
        if (config.bpm) setBpm(config.bpm);
        if (config.metronomeShortcut) setMetronomeShortcut(config.metronomeShortcut);
        if (config.metronomeFrequency) setMetronomeFrequency(config.metronomeFrequency);
        if (config.metronomeDecay) setMetronomeDecay(config.metronomeDecay);
        if (config.metronomeHarmonicCount) setMetronomeHarmonicCount(config.metronomeHarmonicCount);
        if (config.autoAssignShortcuts !== undefined)
          setAutoAssignShortcuts(config.autoAssignShortcuts);
        if (config.tracksOutputDeviceId) setTracksOutputDeviceId(config.tracksOutputDeviceId);
        if (config.metronomeOutputDeviceId)
          setMetronomeOutputDeviceId(config.metronomeOutputDeviceId);
        if (config.tracks) setTracks(config.tracks);
        if (config.timeSignature) setTimeSignature(config.timeSignature);
        if (config.metronomeColor) setMetronomeColor(config.metronomeColor);
        if (config.metronomeVolume !== undefined) setMetronomeVolume(config.metronomeVolume);
        if (config.metronomeAccentFrequency)
          setMetronomeAccentFrequency(config.metronomeAccentFrequency);
        if (config.metronomeAccentDecay) setMetronomeAccentDecay(config.metronomeAccentDecay);
        if (config.metronomeAccentHarmonicCount)
          setMetronomeAccentHarmonicCount(config.metronomeAccentHarmonicCount);
        if (config.beatAccents) setBeatAccents(config.beatAccents);
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
        if (newConfig.metronomeFrequency) setMetronomeFrequency(newConfig.metronomeFrequency);
        if (newConfig.metronomeDecay) setMetronomeDecay(newConfig.metronomeDecay);
        if (newConfig.metronomeHarmonicCount)
          setMetronomeHarmonicCount(newConfig.metronomeHarmonicCount);
        if (newConfig.autoAssignShortcuts !== undefined)
          setAutoAssignShortcuts(newConfig.autoAssignShortcuts);
        if (newConfig.tracksOutputDeviceId) setTracksOutputDeviceId(newConfig.tracksOutputDeviceId);
        if (newConfig.metronomeOutputDeviceId)
          setMetronomeOutputDeviceId(newConfig.metronomeOutputDeviceId);
        if (newConfig.tracks) setTracks(newConfig.tracks);
        if (newConfig.timeSignature) setTimeSignature(newConfig.timeSignature);
        if (newConfig.metronomeColor) setMetronomeColor(newConfig.metronomeColor);
        if (newConfig.metronomeVolume !== undefined) setMetronomeVolume(newConfig.metronomeVolume);
        if (newConfig.metronomeAccentFrequency)
          setMetronomeAccentFrequency(newConfig.metronomeAccentFrequency);
        if (newConfig.metronomeAccentDecay) setMetronomeAccentDecay(newConfig.metronomeAccentDecay);
        if (newConfig.metronomeAccentHarmonicCount)
          setMetronomeAccentHarmonicCount(newConfig.metronomeAccentHarmonicCount);
        if (newConfig.beatAccents) setBeatAccents(newConfig.beatAccents);
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
    if (updates.metronomeFrequency) setMetronomeFrequency(updates.metronomeFrequency);
    if (updates.metronomeDecay) setMetronomeDecay(updates.metronomeDecay);
    if (updates.metronomeHarmonicCount) setMetronomeHarmonicCount(updates.metronomeHarmonicCount);
    if (updates.autoAssignShortcuts !== undefined)
      setAutoAssignShortcuts(updates.autoAssignShortcuts);
    if (updates.tracksOutputDeviceId) setTracksOutputDeviceId(updates.tracksOutputDeviceId);
    if (updates.metronomeOutputDeviceId)
      setMetronomeOutputDeviceId(updates.metronomeOutputDeviceId);
    if (updates.tracks) setTracks(updates.tracks);
    if (updates.timeSignature) setTimeSignature(updates.timeSignature);
    if (updates.metronomeColor) setMetronomeColor(updates.metronomeColor);
    if (updates.metronomeVolume !== undefined) setMetronomeVolume(updates.metronomeVolume);
    if (updates.metronomeAccentFrequency)
      setMetronomeAccentFrequency(updates.metronomeAccentFrequency);
    if (updates.metronomeAccentDecay) setMetronomeAccentDecay(updates.metronomeAccentDecay);
    if (updates.metronomeAccentHarmonicCount)
      setMetronomeAccentHarmonicCount(updates.metronomeAccentHarmonicCount);
    if (updates.beatAccents) setBeatAccents(updates.beatAccents);

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
    metronomeFrequency,
    metronomeDecay,
    metronomeHarmonicCount,
    autoAssignShortcuts,
    isLoaded,
    updateConfig,
    setTheme: (t: Theme) => updateConfig({ theme: t }),
    setLanguage: (l: Language) => updateConfig({ language: l }),
    setFadeOutDuration: (d: number) => updateConfig({ fadeOutDuration: d }),
    setBpm: (b: number) => updateConfig({ bpm: b }),
    setMetronomeShortcut: (s: string | null) => updateConfig({ metronomeShortcut: s }),
    setMetronomeFrequency: (f: number) => updateConfig({ metronomeFrequency: f }),
    setMetronomeDecay: (d: number) => updateConfig({ metronomeDecay: d }),

    setMetronomeHarmonicCount: (h: number) => updateConfig({ metronomeHarmonicCount: h }),
    setAutoAssignShortcuts: (a: boolean) => updateConfig({ autoAssignShortcuts: a }),
    setMetronomeOutputDeviceId: (id: string) => updateConfig({ metronomeOutputDeviceId: id }),
    setTracks: (t: any[]) => updateConfig({ tracks: t }),
    setTimeSignature: (ts: string) => updateConfig({ timeSignature: ts }),
    setMetronomeColor: (c: string) => updateConfig({ metronomeColor: c }),
    setMetronomeVolume: (v: number) => updateConfig({ metronomeVolume: v }),
    setTracksOutputDeviceId: (id: string) => updateConfig({ tracksOutputDeviceId: id }),
    tracksOutputDeviceId,
    metronomeOutputDeviceId,
    timeSignature,
    metronomeColor,
    metronomeVolume,
    // Accent setters
    metronomeAccentFrequency,
    metronomeAccentDecay,
    metronomeAccentHarmonicCount,
    beatAccents,
    setMetronomeAccentFrequency: (f: number) => updateConfig({ metronomeAccentFrequency: f }),
    setMetronomeAccentDecay: (d: number) => updateConfig({ metronomeAccentDecay: d }),
    setMetronomeAccentHarmonicCount: (h: number) =>
      updateConfig({ metronomeAccentHarmonicCount: h }),
    setBeatAccents: (a: number[]) => updateConfig({ beatAccents: a })
  };
};
