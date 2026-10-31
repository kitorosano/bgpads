import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { RemoteCommand, TonalPadBankValidation } from '../types';

const api = {
  loadConfig: (): Promise<unknown> => ipcRenderer.invoke('load-config'),
  saveConfig: (config: unknown): Promise<boolean> => ipcRenderer.invoke('save-config', config),

  readBuffer: (path: string): Promise<Uint8Array> => ipcRenderer.invoke('read-buffer', path),
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),

  openFileDialog: (): Promise<string[] | null> => ipcRenderer.invoke('dialog-open-file'),
  saveTracksFile: (content: string): Promise<boolean> =>
    ipcRenderer.invoke('save-tracks-file', content),
  loadTracksFile: (): Promise<Electron.IpcRendererEvent> => ipcRenderer.invoke('load-tracks-file'),

  selectTonalPadBank: (): Promise<TonalPadBankValidation | null> =>
    ipcRenderer.invoke('select-tonal-pad-bank'),
  validateTonalPadBank: (path: string): Promise<TonalPadBankValidation> =>
    ipcRenderer.invoke('validate-tonal-pad-bank', path),
  resolveTonalPadPath: (directoryPath: string, key: string): Promise<string> =>
    ipcRenderer.invoke('resolve-tonal-pad-path', directoryPath, key),

  onMenuAddAudio: (callback: () => void) => {
    const subscription = (_event: Electron.IpcRendererEvent) => callback();
    ipcRenderer.on('menu-add-audio', subscription);
    return () => ipcRenderer.removeListener('menu-add-audio', subscription);
  },
  onMenuClearPads: (callback: () => void) => {
    const subscription = (_event: Electron.IpcRendererEvent) => callback();
    ipcRenderer.on('menu-clear-pads', subscription);
    return () => ipcRenderer.removeListener('menu-clear-pads', subscription);
  },
  onMenuOpenSettings: (callback: () => void) => {
    const subscription = (_event: Electron.IpcRendererEvent) => callback();
    ipcRenderer.on('menu-open-settings', subscription);
    return () => ipcRenderer.removeListener('menu-open-settings', subscription);
  },
  onMenuOpenAbout: (callback: () => void) => {
    const subscription = (_event: Electron.IpcRendererEvent) => callback();
    ipcRenderer.on('menu-open-about', subscription);
    return () => ipcRenderer.removeListener('menu-open-about', subscription);
  },

  onMenuExportTracks: (callback: () => void) => {
    const subscription = (_event: Electron.IpcRendererEvent) => callback();
    ipcRenderer.on('menu-export-tracks', subscription);
    return () => ipcRenderer.removeListener('menu-export-tracks', subscription);
  },
  onMenuImportTracks: (callback: () => void) => {
    const subscription = (_event: Electron.IpcRendererEvent) => callback();
    ipcRenderer.on('menu-import-tracks', subscription);
    return () => ipcRenderer.removeListener('menu-import-tracks', subscription);
  },

  onRemoteCommand: (callback: (command: RemoteCommand) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, command: RemoteCommand) =>
      callback(command);

    ipcRenderer.on('remote-command', subscription);

    return () => ipcRenderer.removeListener('remote-command', subscription);
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
