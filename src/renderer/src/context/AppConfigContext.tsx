import { AppConfig, AudioTrack } from '@renderer/types';
import { createContext, Dispatch, SetStateAction } from 'react';
import { Language, Theme } from 'src/types';

export interface AppConfigContextValue {
  theme: Theme;
  language: Language;
  fadeOutDuration: number;
  tracks: AudioTrack[];
  bpm: number;
  metronomeShortcut: string | null;
  metronomeFrequency: number;
  metronomeDecay: number;
  metronomeHarmonicCount: number;
  autoAssignShortcuts: boolean;
  isLoading: boolean;

  tracksOutputDeviceId: string;
  metronomeOutputDeviceId: string;
  timeSignature: string;
  metronomeColor: string;
  metronomeVolume: number;

  metronomeAccentFrequency: number;
  metronomeAccentDecay: number;
  metronomeAccentHarmonicCount: number;
  beatAccents: number[];

  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;

  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setFadeOutDuration: (duration: number) => void;
  setBpm: (bpm: number) => void;
  setMetronomeShortcut: (shortcut: string | null) => void;
  setMetronomeFrequency: (frequency: number) => void;
  setMetronomeDecay: (decay: number) => void;
  setMetronomeHarmonicCount: (count: number) => void;
  setAutoAssignShortcuts: (enabled: boolean) => void;
  setTracks: Dispatch<SetStateAction<AudioTrack[]>>;
  setTracksOutputDeviceId: (id: string) => void;
  setMetronomeOutputDeviceId: (id: string) => void;
  setTimeSignature: (signature: string) => void;
  setMetronomeColor: (color: string) => void;
  setMetronomeVolume: (volume: number) => void;
  setMetronomeAccentFrequency: (frequency: number) => void;
  setMetronomeAccentDecay: (decay: number) => void;
  setMetronomeAccentHarmonicCount: (count: number) => void;
  setBeatAccents: (accents: number[]) => void;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export default AppConfigContext;
