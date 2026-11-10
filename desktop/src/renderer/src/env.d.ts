/// <reference types="vite/client" />

import { TonalPadBankValidation } from '../types';

interface Window {
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: unknown[]): Promise<unknown>;
      on(channel: string, listener: (event: any, ...args: any[]) => void): any;
      // ... other methods if needed
    };
  };
  api: {
    loadConfig: () => Promise<any>;
    saveConfig: (config: any) => Promise<boolean>;

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
    resolveTonalPadPath: (directoryPath: string, key: string) => Promise<string>;
  };
}
