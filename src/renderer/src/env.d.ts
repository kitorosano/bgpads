/// <reference types="vite/client" />

interface Window {
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: unknown[]): Promise<unknown>;
      // ... other methods if needed
    };
  };
  api: {
    loadConfig: () => Promise<any>;
    saveConfig: (config: any) => Promise<boolean>;
    readBuffer: (path: string) => Promise<Uint8Array>;
    getPathForFile: (file: File) => string;
    onMenuAddAudio: (callback: () => void) => () => void;
    onMenuOpenSettings: (callback: () => void) => () => void;
    onMenuOpenAbout: (callback: () => void) => () => void;
  };
}
