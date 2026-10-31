import { ElectronAPI } from '@electron-toolkit/preload';
import { RemoteCommand, TonalPadBankValidation } from '../types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      loadConfig: () => Promise<unknown>;
      saveConfig: (config: unknown) => Promise<boolean>;

      readBuffer: (path: string) => Promise<Uint8Array>;
      getPathForFile: (file: File) => string;

      openFileDialog: () => Promise<string[] | null>;
      saveTracksFile: (content: string) => Promise<boolean>;
      loadTracksFile: () => Promise<any>;

      selectTonalPadBank: () => Promise<TonalPadBankValidation | null>;
      validateTonalPadBank: (path: string) => Promise<TonalPadBankValidation>;
      resolveTonalPadPath: (directoryPath: string, key: string) => Promise<string>;

      updateRemoteState: (state: RemoteState) => void;

      onMenuAddAudio: (callback: () => void) => () => void;
      onMenuClearPads: (callback: () => void) => () => void;
      onMenuOpenSettings: (callback: () => void) => () => void;
      onMenuOpenAbout: (callback: () => void) => () => void;

      onMenuExportTracks: (callback: () => void) => () => void;
      onMenuImportTracks: (callback: () => void) => () => void;

      onRemoteCommand: (callback: (command: RemoteCommand) => void) => () => void;
    };
  }
}
