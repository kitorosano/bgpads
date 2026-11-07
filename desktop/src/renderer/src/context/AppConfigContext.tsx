import { AppConfig, AudioTrack } from '@renderer/types';
import { createContext, Dispatch, SetStateAction } from 'react';
import { Language, Theme } from 'src/types';

export interface AppConfigContextValue {
  isLoading: boolean;
  theme: Theme;
  language: Language;

  fadeOutDuration: number;
  tonalPadBankPath?: string;
  autoAssignPositionBasedShortcuts: boolean;
  tracks: AudioTrack[];
  tracksOutputDeviceId: string;

  bpm: number;
  timeSignature: string;
  metronomeColor: string;
  metronomeVolume: number;
  metronomeShortcut: string | null;
  metronomeFrequency: number;
  metronomeDecay: number;
  metronomeHarmonicCount: number;

  beatAccents: number[];
  metronomeAccentFrequency: number;
  metronomeAccentDecay: number;
  metronomeAccentHarmonicCount: number;
  metronomeOutputDeviceId: string;

  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;

  setFadeOutDuration: (duration: number) => void;
  setTonalPadBankPath: (path: string | undefined) => void;
  setAutoAssignPositionBasedShortcuts: (enabled: boolean) => void;
  setTracks: Dispatch<SetStateAction<AudioTrack[]>>;
  setTracksOutputDeviceId: (id: string) => void;

  setBpm: (bpm: number) => void;
  setTimeSignature: (signature: string) => void;
  setMetronomeColor: (color: string) => void;
  setMetronomeVolume: (volume: number) => void;
  setMetronomeShortcut: (shortcut: string | null) => void;
  setMetronomeFrequency: (frequency: number) => void;
  setMetronomeDecay: (decay: number) => void;
  setMetronomeHarmonicCount: (count: number) => void;

  setBeatAccents: (accents: number[]) => void;
  setMetronomeAccentFrequency: (frequency: number) => void;
  setMetronomeAccentDecay: (decay: number) => void;
  setMetronomeAccentHarmonicCount: (count: number) => void;
  setMetronomeOutputDeviceId: (id: string) => void;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export default AppConfigContext;
