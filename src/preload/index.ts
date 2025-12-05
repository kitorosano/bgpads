import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer, webUtils } from 'electron';

// Custom APIs for renderer
const api = {
  loadConfig: (): Promise<unknown> => ipcRenderer.invoke('load-config'),
  saveConfig: (config: unknown): Promise<boolean> => ipcRenderer.invoke('save-config', config),
  readBuffer: (path: string): Promise<Uint8Array> => ipcRenderer.invoke('read-buffer', path),
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),
  onMenuAddAudio: (callback: () => void) => {
    const subscription = (_event: any) => callback();
    ipcRenderer.on('menu-add-audio', subscription);
    return () => ipcRenderer.removeListener('menu-add-audio', subscription);
  },
  onMenuOpenSettings: (callback: () => void) => {
    const subscription = (_event: any) => callback();
    ipcRenderer.on('menu-open-settings', subscription);
    return () => ipcRenderer.removeListener('menu-open-settings', subscription);
  },
  onMenuOpenAbout: (callback: () => void) => {
    const subscription = (_event: any) => callback();
    ipcRenderer.on('menu-open-about', subscription);
    return () => ipcRenderer.removeListener('menu-open-about', subscription);
  },
  openFileDialog: (): Promise<string[] | null> => ipcRenderer.invoke('dialog-open-file')
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
