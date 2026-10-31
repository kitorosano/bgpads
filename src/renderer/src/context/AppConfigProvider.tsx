import { AppConfig, AudioTrack } from '@renderer/types';
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  DEFAULT_BEAT_ACCENTS,
  DEFAULT_BPM,
  DEFAULT_CROSSFADE_DURATION,
  DEFAULT_LANGUAGE,
  DEFAULT_METRONOME_ACCENT_DECAY,
  DEFAULT_METRONOME_ACCENT_FREQUENCY,
  DEFAULT_METRONOME_ACCENT_HARMONIC_COUNT,
  DEFAULT_METRONOME_COLOR,
  DEFAULT_METRONOME_DECAY,
  DEFAULT_METRONOME_FREQUENCY,
  DEFAULT_METRONOME_HARMONIC_COUNT,
  DEFAULT_METRONOME_TIME_SIGNATURE,
  DEFAULT_METRONOME_VOLUME,
  DEFAULT_THEME
} from '../../../constants';
import { Language, Theme } from '../../../types';
import AppConfigContext, { AppConfigContextValue } from './AppConfigContext';

interface AppConfigProviderProps {
  children: ReactNode;
}

const AppConfigProvider = ({ children }: AppConfigProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const [fadeOutDuration, setFadeOutDuration] = useState(DEFAULT_CROSSFADE_DURATION);
  const [tonalPadBankPath, setTonalPadBankPath] = useState<string | undefined>();
  const [autoAssignPositionBasedShortcuts, setAutoAssignPositionBasedShortcuts] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [tracksOutputDeviceId, setTracksOutputDeviceId] = useState<string>('default');

  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState<string>(DEFAULT_METRONOME_TIME_SIGNATURE);
  const [metronomeColor, setMetronomeColor] = useState<string>(DEFAULT_METRONOME_COLOR);
  const [metronomeVolume, setMetronomeVolume] = useState(DEFAULT_METRONOME_VOLUME);
  const [metronomeShortcut, setMetronomeShortcut] = useState<string | null>(null);
  const [metronomeFrequency, setMetronomeFrequency] = useState(DEFAULT_METRONOME_FREQUENCY);
  const [metronomeDecay, setMetronomeDecay] = useState(DEFAULT_METRONOME_DECAY);
  const [metronomeHarmonicCount, setMetronomeHarmonicCount] = useState(
    DEFAULT_METRONOME_HARMONIC_COUNT
  );

  const [beatAccents, setBeatAccents] = useState<number[]>(DEFAULT_BEAT_ACCENTS);
  const [metronomeAccentFrequency, setMetronomeAccentFrequency] = useState(
    DEFAULT_METRONOME_ACCENT_FREQUENCY
  );
  const [metronomeAccentDecay, setMetronomeAccentDecay] = useState(DEFAULT_METRONOME_ACCENT_DECAY);
  const [metronomeAccentHarmonicCount, setMetronomeAccentHarmonicCount] = useState(
    DEFAULT_METRONOME_ACCENT_HARMONIC_COUNT
  );
  const [metronomeOutputDeviceId, setMetronomeOutputDeviceId] = useState<string>('default');

  const configRef = useRef<AppConfig | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const init = async () => {
      const config = (await window.api.loadConfig()) as AppConfig | null;
      if (config) {
        configRef.current = config;

        if (config.theme) {
          setTheme(config.theme);
        }
        if (config.language) {
          setLanguage(config.language);
        }

        if (config.fadeOutDuration !== undefined) {
          setFadeOutDuration(config.fadeOutDuration);
        }
        if (config.autoAssignPositionBasedShortcuts !== undefined) {
          setAutoAssignPositionBasedShortcuts(config.autoAssignPositionBasedShortcuts);
        }
        if (Array.isArray(config.tracks)) {
          setTracks(config.tracks);
        }
        if (config.tracksOutputDeviceId) {
          setTracksOutputDeviceId(config.tracksOutputDeviceId);
        }
        setTonalPadBankPath(config.tonalPadBankPath);

        if (config.bpm) {
          setBpm(config.bpm);
        }
        if (config.timeSignature) {
          setTimeSignature(config.timeSignature);
        }
        if (config.metronomeColor) {
          setMetronomeColor(config.metronomeColor);
        }
        if (config.metronomeVolume !== undefined) {
          setMetronomeVolume(config.metronomeVolume);
        }
        if (config.metronomeShortcut !== undefined) {
          setMetronomeShortcut(config.metronomeShortcut);
        }
        if (config.metronomeFrequency !== undefined) {
          setMetronomeFrequency(config.metronomeFrequency);
        }
        if (config.metronomeDecay !== undefined) {
          setMetronomeDecay(config.metronomeDecay);
        }
        if (config.metronomeHarmonicCount !== undefined) {
          setMetronomeHarmonicCount(config.metronomeHarmonicCount);
        }

        if (config.beatAccents) {
          setBeatAccents(config.beatAccents);
        }
        if (config.metronomeAccentFrequency !== undefined) {
          setMetronomeAccentFrequency(config.metronomeAccentFrequency);
        }
        if (config.metronomeAccentDecay !== undefined) {
          setMetronomeAccentDecay(config.metronomeAccentDecay);
        }
        if (config.metronomeAccentHarmonicCount !== undefined) {
          setMetronomeAccentHarmonicCount(config.metronomeAccentHarmonicCount);
        }
        if (config.metronomeOutputDeviceId) {
          setMetronomeOutputDeviceId(config.metronomeOutputDeviceId);
        }
      }
      setIsLoading(false);
    };
    init();

    // Listen for settings changes from other windows
    const removeSettingsChangedListener = window.electron.ipcRenderer.on(
      'settings-changed',
      (_event, newConfig) => {
        configRef.current = newConfig;

        if (newConfig.theme) {
          setTheme(newConfig.theme);
        }
        if (newConfig.language) {
          setLanguage(newConfig.language);
        }

        if (newConfig.fadeOutDuration !== undefined) {
          setFadeOutDuration(newConfig.fadeOutDuration);
        }
        if (newConfig.autoAssignPositionBasedShortcuts !== undefined) {
          setAutoAssignPositionBasedShortcuts(newConfig.autoAssignPositionBasedShortcuts);
        }
        if (Array.isArray(newConfig.tracks)) {
          setTracks(newConfig.tracks);
        }
        if (newConfig.tracksOutputDeviceId) {
          setTracksOutputDeviceId(newConfig.tracksOutputDeviceId);
        }
        setTonalPadBankPath(newConfig.tonalPadBankPath);

        if (newConfig.bpm) {
          setBpm(newConfig.bpm);
        }
        if (newConfig.timeSignature) {
          setTimeSignature(newConfig.timeSignature);
        }
        if (newConfig.metronomeColor) {
          setMetronomeColor(newConfig.metronomeColor);
        }
        if (newConfig.metronomeVolume !== undefined) {
          setMetronomeVolume(newConfig.metronomeVolume);
        }
        if (newConfig.metronomeShortcut !== undefined) {
          setMetronomeShortcut(newConfig.metronomeShortcut);
        }
        if (newConfig.metronomeFrequency !== undefined) {
          setMetronomeFrequency(newConfig.metronomeFrequency);
        }
        if (newConfig.metronomeDecay !== undefined) {
          setMetronomeDecay(newConfig.metronomeDecay);
        }
        if (newConfig.metronomeHarmonicCount !== undefined) {
          setMetronomeHarmonicCount(newConfig.metronomeHarmonicCount);
        }

        if (newConfig.beatAccents) {
          setBeatAccents(newConfig.beatAccents);
        }
        if (newConfig.metronomeAccentFrequency !== undefined) {
          setMetronomeAccentFrequency(newConfig.metronomeAccentFrequency);
        }
        if (newConfig.metronomeAccentDecay !== undefined) {
          setMetronomeAccentDecay(newConfig.metronomeAccentDecay);
        }
        if (newConfig.metronomeAccentHarmonicCount !== undefined) {
          setMetronomeAccentHarmonicCount(newConfig.metronomeAccentHarmonicCount);
        }
        if (newConfig.metronomeOutputDeviceId) {
          setMetronomeOutputDeviceId(newConfig.metronomeOutputDeviceId);
        }
      }
    );

    return () => {
      removeSettingsChangedListener?.();
    };
  }, []);

  // Apply theme globally
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const updateConfig = useCallback(async (updates: Partial<AppConfig>): Promise<void> => {
    if (!configRef.current) return;

    const newConfig: AppConfig = {
      ...configRef.current,
      ...updates
    };
    configRef.current = newConfig;

    if (updates.theme !== undefined) {
      setTheme(updates.theme);
    }
    if (updates.language !== undefined) {
      setLanguage(updates.language);
    }

    if (updates.fadeOutDuration !== undefined) {
      setFadeOutDuration(updates.fadeOutDuration);
    }
    if (updates.autoAssignPositionBasedShortcuts !== undefined) {
      setAutoAssignPositionBasedShortcuts(updates.autoAssignPositionBasedShortcuts);
    }
    if (updates.tracks !== undefined) {
      setTracks(updates.tracks);
    }
    if (updates.tracksOutputDeviceId !== undefined) {
      setTracksOutputDeviceId(updates.tracksOutputDeviceId);
    }
    if ('tonalPadBankPath' in updates) {
      setTonalPadBankPath(updates.tonalPadBankPath);
    }

    if (updates.bpm !== undefined) {
      setBpm(updates.bpm);
    }
    if (updates.timeSignature !== undefined) {
      setTimeSignature(updates.timeSignature);
    }
    if (updates.metronomeColor !== undefined) {
      setMetronomeColor(updates.metronomeColor);
    }
    if (updates.metronomeVolume !== undefined) {
      setMetronomeVolume(updates.metronomeVolume);
    }
    if (updates.metronomeShortcut !== undefined) {
      setMetronomeShortcut(updates.metronomeShortcut);
    }
    if (updates.metronomeFrequency !== undefined) {
      setMetronomeFrequency(updates.metronomeFrequency);
    }
    if (updates.metronomeDecay !== undefined) {
      setMetronomeDecay(updates.metronomeDecay);
    }
    if (updates.metronomeHarmonicCount !== undefined) {
      setMetronomeHarmonicCount(updates.metronomeHarmonicCount);
    }

    if (updates.beatAccents !== undefined) {
      setBeatAccents(updates.beatAccents);
    }
    if (updates.metronomeAccentFrequency !== undefined) {
      setMetronomeAccentFrequency(updates.metronomeAccentFrequency);
    }
    if (updates.metronomeAccentDecay !== undefined) {
      setMetronomeAccentDecay(updates.metronomeAccentDecay);
    }
    if (updates.metronomeAccentHarmonicCount !== undefined) {
      setMetronomeAccentHarmonicCount(updates.metronomeAccentHarmonicCount);
    }
    if (updates.metronomeOutputDeviceId !== undefined) {
      setMetronomeOutputDeviceId(updates.metronomeOutputDeviceId);
    }
    // Serializamos las escrituras para que nunca puedan terminar fuera de orden.
    const snapshot = newConfig;

    saveQueueRef.current = saveQueueRef.current
      .then(async () => {
        await window.api.saveConfig(snapshot);

        await window.electron.ipcRenderer.invoke('broadcast-settings-change', snapshot);
      })
      .catch((error) => {
        console.error('Failed to save app config:', error);
      });

    await saveQueueRef.current;
  }, []);

  const updateTracks: Dispatch<SetStateAction<AudioTrack[]>> = useCallback(
    (action) => {
      const currentTracks = configRef.current?.tracks ?? [];

      const nextTracks = typeof action === 'function' ? action(currentTracks) : action;

      updateConfig({
        tracks: nextTracks
      });
    },
    [updateConfig]
  );

  const value: AppConfigContextValue = {
    isLoading,
    theme,
    language,

    fadeOutDuration,
    tonalPadBankPath,
    autoAssignPositionBasedShortcuts,
    tracks,
    tracksOutputDeviceId,

    bpm,
    timeSignature,
    metronomeVolume,
    metronomeColor,
    metronomeShortcut,
    metronomeFrequency,
    metronomeDecay,
    metronomeHarmonicCount,

    beatAccents,
    metronomeAccentFrequency,
    metronomeAccentDecay,
    metronomeAccentHarmonicCount,
    metronomeOutputDeviceId,

    updateConfig,
    setTheme: (t) => updateConfig({ theme: t }),
    setLanguage: (l) => updateConfig({ language: l }),

    setFadeOutDuration: (d) => updateConfig({ fadeOutDuration: d }),
    setTonalPadBankPath: (path) => updateConfig({ tonalPadBankPath: path }),
    setAutoAssignPositionBasedShortcuts: (a) =>
      updateConfig({ autoAssignPositionBasedShortcuts: a }),
    setTracks: updateTracks,
    setTracksOutputDeviceId: (id) => updateConfig({ tracksOutputDeviceId: id }),

    setBpm: (b) => updateConfig({ bpm: b }),
    setTimeSignature: (ts) => updateConfig({ timeSignature: ts }),
    setMetronomeColor: (c) => updateConfig({ metronomeColor: c }),
    setMetronomeVolume: (v) => updateConfig({ metronomeVolume: v }),
    setMetronomeShortcut: (s) => updateConfig({ metronomeShortcut: s }),
    setMetronomeFrequency: (f) => updateConfig({ metronomeFrequency: f }),
    setMetronomeDecay: (d) => updateConfig({ metronomeDecay: d }),
    setMetronomeHarmonicCount: (h) => updateConfig({ metronomeHarmonicCount: h }),

    setBeatAccents: (a) => updateConfig({ beatAccents: a }),
    setMetronomeAccentFrequency: (f) => updateConfig({ metronomeAccentFrequency: f }),
    setMetronomeAccentDecay: (d) => updateConfig({ metronomeAccentDecay: d }),
    setMetronomeAccentHarmonicCount: (h) => updateConfig({ metronomeAccentHarmonicCount: h }),
    setMetronomeOutputDeviceId: (id) => updateConfig({ metronomeOutputDeviceId: id })
  };

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
};

export default AppConfigProvider;
