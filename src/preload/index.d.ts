import { ElectronAPI } from '@electron-toolkit/preload';
import { TonalPadBankValidation } from '../types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      loadConfig: () => Promise<unknown>;
      saveConfig: (config: unknown) => Promise<boolean>;

      readBuffer: (path: string) => Promise<Uint8Array>;
      getPathForFile: (file: File) => string;

      onMenuAddAudio: (callback: () => void) => () => void;
      onMenuClearPads: (callback: () => void) => () => void;
      onMenuOpenSettings: (callback: () => void) => () => void;
      onMenuOpenAbout: (callback: () => void) => () => void;

      openFileDialog: () => Promise<string[] | null>;
      saveTracksFile: (content: string) => Promise<boolean>;
      loadTracksFile: () => Promise<any>;

      onMenuExportTracks: (callback: () => void) => () => void;
      onMenuImportTracks: (callback: () => void) => () => void;

      selectTonalPadBank: () => Promise<TonalPadBankValidation | null>;
      validateTonalPadBank: (path: string) => Promise<TonalPadBankValidation>;
    };
  }
}
