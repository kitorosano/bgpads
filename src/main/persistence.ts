import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_FILE_NAME = 'bgpads-config.json';

function getConfigPath(): string {
  return path.join(app.getPath('userData'), CONFIG_FILE_NAME);
}

export function setupPersistence(): void {
  ipcMain.handle('load-config', async () => {
    try {
      const configPath = getConfigPath();
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  });

  ipcMain.handle('save-config', async (_, config: unknown) => {
    try {
      const configPath = getConfigPath();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    }
  });

  ipcMain.handle('read-buffer', async (_, filePath: string) => {
    try {
      const buffer = fs.readFileSync(filePath);
      return buffer;
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  });
}
