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
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [fadeOutDuration, setFadeOutDuration] = useState(DEFAULT_CROSSFADE_DURATION);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [metronomeShortcut, setMetronomeShortcut] = useState<string | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metronomeFrequency, setMetronomeFrequency] = useState(DEFAULT_METRONOME_FREQUENCY);
  const [metronomeDecay, setMetronomeDecay] = useState(DEFAULT_METRONOME_DECAY);
  const [metronomeHarmonicCount, setMetronomeHarmonicCount] = useState(
    DEFAULT_METRONOME_HARMONIC_COUNT
  );
  const [autoAssignPositionBasedShortcuts, setAutoAssignPositionBasedShortcuts] = useState(false);
  const [tracksOutputDeviceId, setTracksOutputDeviceId] = useState<string>('default');
  const [metronomeOutputDeviceId, setMetronomeOutputDeviceId] = useState<string>('default');
  const [timeSignature, setTimeSignature] = useState<string>(DEFAULT_METRONOME_TIME_SIGNATURE);
  const [metronomeColor, setMetronomeColor] = useState<string>(DEFAULT_METRONOME_COLOR);
  const [metronomeVolume, setMetronomeVolume] = useState(DEFAULT_METRONOME_VOLUME);
  const [metronomeAccentFrequency, setMetronomeAccentFrequency] = useState(
    DEFAULT_METRONOME_ACCENT_FREQUENCY
  );
  const [metronomeAccentDecay, setMetronomeAccentDecay] = useState(DEFAULT_METRONOME_ACCENT_DECAY);
  const [metronomeAccentHarmonicCount, setMetronomeAccentHarmonicCount] = useState(
    DEFAULT_METRONOME_ACCENT_HARMONIC_COUNT
  );
  const [beatAccents, setBeatAccents] = useState<number[]>(DEFAULT_BEAT_ACCENTS);
  const [tonalPadBankPath, setTonalPadBankPath] = useState<string | undefined>();

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
        if (config.fadeOutDuration) {
          setFadeOutDuration(config.fadeOutDuration);
        }
        if (config.bpm) {
          setBpm(config.bpm);
        }
        if (config.metronomeShortcut) {
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
        if (config.autoAssignPositionBasedShortcuts !== undefined) {
          setAutoAssignPositionBasedShortcuts(config.autoAssignPositionBasedShortcuts);
        }
        if (config.tracksOutputDeviceId) {
          setTracksOutputDeviceId(config.tracksOutputDeviceId);
        }
        if (config.metronomeOutputDeviceId) {
          setMetronomeOutputDeviceId(config.metronomeOutputDeviceId);
        }
        if (Array.isArray(config.tracks)) {
          setTracks(config.tracks);
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
        if (config.metronomeAccentFrequency !== undefined) {
          setMetronomeAccentFrequency(config.metronomeAccentFrequency);
        }
        if (config.metronomeAccentDecay !== undefined) {
          setMetronomeAccentDecay(config.metronomeAccentDecay);
        }
        if (config.metronomeAccentHarmonicCount !== undefined) {
          setMetronomeAccentHarmonicCount(config.metronomeAccentHarmonicCount);
        }
        if (config.beatAccents) {
          setBeatAccents(config.beatAccents);
        }
        if (config.tonalPadBankPath) {
          setTonalPadBankPath(config.tonalPadBankPath);
        }
      }
      setIsLoading(false);
    };
    init();

    // Listen for settings changes from other windows
    const removeSettingsChangedListener = window.electron.ipcRenderer.on(
      'settings-changed',
      (_event, newConfig) => {
        if (newConfig.theme) {
          setTheme(newConfig.theme);
        }
        if (newConfig.language) {
          setLanguage(newConfig.language);
        }
        if (newConfig.fadeOutDuration) {
          setFadeOutDuration(newConfig.fadeOutDuration);
        }
        if (newConfig.bpm) {
          setBpm(newConfig.bpm);
        }
        if (newConfig.metronomeShortcut) {
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
        if (newConfig.autoAssignPositionBasedShortcuts !== undefined) {
          setAutoAssignPositionBasedShortcuts(newConfig.autoAssignPositionBasedShortcuts);
        }
        if (newConfig.tracksOutputDeviceId) {
          setTracksOutputDeviceId(newConfig.tracksOutputDeviceId);
        }
        if (newConfig.metronomeOutputDeviceId) {
          setMetronomeOutputDeviceId(newConfig.metronomeOutputDeviceId);
        }
        if (Array.isArray(newConfig.tracks)) {
          setTracks(newConfig.tracks);
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
        if (newConfig.metronomeAccentFrequency !== undefined) {
          setMetronomeAccentFrequency(newConfig.metronomeAccentFrequency);
        }
        if (newConfig.metronomeAccentDecay !== undefined) {
          setMetronomeAccentDecay(newConfig.metronomeAccentDecay);
        }
        if (newConfig.metronomeAccentHarmonicCount !== undefined) {
          setMetronomeAccentHarmonicCount(newConfig.metronomeAccentHarmonicCount);
        }
        if (newConfig.beatAccents) {
          setBeatAccents(newConfig.beatAccents);
        }
        if (newConfig.tonalPadBankPath) {
          setTonalPadBankPath(newConfig.tonalPadBankPath);
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
    if (updates.bpm !== undefined) {
      setBpm(updates.bpm);
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
    if (updates.autoAssignPositionBasedShortcuts !== undefined) {
      setAutoAssignPositionBasedShortcuts(updates.autoAssignPositionBasedShortcuts);
    }
    if (updates.tracksOutputDeviceId !== undefined) {
      setTracksOutputDeviceId(updates.tracksOutputDeviceId);
    }
    if (updates.metronomeOutputDeviceId !== undefined) {
      setMetronomeOutputDeviceId(updates.metronomeOutputDeviceId);
    }
    if (updates.tracks !== undefined) {
      setTracks(updates.tracks);
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
    if (updates.metronomeAccentFrequency !== undefined) {
      setMetronomeAccentFrequency(updates.metronomeAccentFrequency);
    }
    if (updates.metronomeAccentDecay !== undefined) {
      setMetronomeAccentDecay(updates.metronomeAccentDecay);
    }
    if (updates.metronomeAccentHarmonicCount !== undefined) {
      setMetronomeAccentHarmonicCount(updates.metronomeAccentHarmonicCount);
    }
    if (updates.beatAccents !== undefined) {
      setBeatAccents(updates.beatAccents);
    }
    if (updates.tonalPadBankPath !== undefined) {
      setTonalPadBankPath(updates.tonalPadBankPath);
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
      void updateConfig({
        tracks: typeof action === 'function' ? action(tracks) : action
      });
    },
    [tracks, updateConfig]
  );

  const value: AppConfigContextValue = {
    theme,
    language,
    fadeOutDuration,
    tracks,
    bpm,
    metronomeShortcut,
    metronomeFrequency,
    metronomeDecay,
    metronomeHarmonicCount,
    autoAssignPositionBasedShortcuts,
    isLoading,
    updateConfig,

    setTheme: (t) => void updateConfig({ theme: t }),
    setLanguage: (l) => void updateConfig({ language: l }),
    setFadeOutDuration: (d) => void updateConfig({ fadeOutDuration: d }),
    setBpm: (b) => void updateConfig({ bpm: b }),
    setMetronomeShortcut: (s) => void updateConfig({ metronomeShortcut: s }),

    setMetronomeFrequency: (f) => void updateConfig({ metronomeFrequency: f }),

    setMetronomeDecay: (d) => void updateConfig({ metronomeDecay: d }),

    setMetronomeHarmonicCount: (h) => void updateConfig({ metronomeHarmonicCount: h }),

    setAutoAssignPositionBasedShortcuts: (a) =>
      void updateConfig({ autoAssignPositionBasedShortcuts: a }),

    setTracks: updateTracks,

    setMetronomeOutputDeviceId: (id) => void updateConfig({ metronomeOutputDeviceId: id }),

    setTracksOutputDeviceId: (id) => void updateConfig({ tracksOutputDeviceId: id }),

    setTimeSignature: (ts) => void updateConfig({ timeSignature: ts }),

    setMetronomeColor: (c) => void updateConfig({ metronomeColor: c }),

    setMetronomeVolume: (v) => void updateConfig({ metronomeVolume: v }),

    tracksOutputDeviceId,
    metronomeOutputDeviceId,
    timeSignature,
    metronomeColor,
    metronomeVolume,

    metronomeAccentFrequency,
    metronomeAccentDecay,
    metronomeAccentHarmonicCount,
    beatAccents,
    tonalPadBankPath,

    setMetronomeAccentFrequency: (f) => void updateConfig({ metronomeAccentFrequency: f }),

    setMetronomeAccentDecay: (d) => void updateConfig({ metronomeAccentDecay: d }),

    setMetronomeAccentHarmonicCount: (h) => void updateConfig({ metronomeAccentHarmonicCount: h }),

    setBeatAccents: (a) => void updateConfig({ beatAccents: a }),

    setTonalPadBankPath: (path) => void updateConfig({ tonalPadBankPath: path })
  };

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
};

export default AppConfigProvider;
