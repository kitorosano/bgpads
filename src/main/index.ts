import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import { join } from 'path';
import icon from '../../resources/icon.png?asset';
import {
  DEFAULT_ABOUT_WINDOW_HEIGHT,
  DEFAULT_ABOUT_WINDOW_WIDTH,
  DEFAULT_LANGUAGE,
  DEFAULT_MAIN_WINDOW_HEIGHT,
  DEFAULT_MAIN_WINDOW_WIDTH,
  DEFAULT_SETTINGS_WINDOW_HEIGHT,
  DEFAULT_SETTINGS_WINDOW_WIDTH,
  MAIN_WINDOW_MIN_HEIGHT,
  MAIN_WINDOW_MIN_WIDTH
} from '../constants';
import { translations } from '../i18n';
import { Language } from '../types';
import { setupPersistence } from './persistence';

// Global reference to main window
let mainWindow: BrowserWindow | null = null;

const setMenu = (language: Language) => {
  const t = translations[language] || translations[DEFAULT_LANGUAGE];
  const template = [
    {
      label: t.file,
      submenu: [
        {
          label: t.addAudio,
          click: () => mainWindow?.webContents.send('menu-add-audio')
        },
        {
          label: t.preferences,
          click: () => ipcMain.emit('menu-open-settings')
        },
        { type: 'separator' },
        { label: t.quit, role: 'quit' }
      ]
    },
    {
      label: t.help,
      submenu: [
        {
          label: t.about,
          click: () => ipcMain.emit('menu-open-about')
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
};

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: DEFAULT_MAIN_WINDOW_WIDTH,
    height: DEFAULT_MAIN_WINDOW_HEIGHT,
    minWidth: MAIN_WINDOW_MIN_WIDTH,
    minHeight: MAIN_WINDOW_MIN_HEIGHT,
    show: false,
    autoHideMenuBar: false,
    icon,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Initial menu (default to Spanish, will be updated by renderer or persistence later)
  setMenu(DEFAULT_LANGUAGE);

  // IPC handler for window resizing
  ipcMain.handle('resize-window', (_event, { width, height }) => {
    if (!mainWindow) return;
    const currentSize = mainWindow.getSize();
    const newWidth = Math.max(width, 400);
    const newHeight = Math.max(height, 400);

    // Only resize if significantly different
    if (Math.abs(currentSize[0] - newWidth) > 50 || Math.abs(currentSize[1] - newHeight) > 50) {
      mainWindow.setSize(newWidth, newHeight, true);
    }
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  setupPersistence();

  // Window Management
  let settingsWindow: BrowserWindow | null = null;
  let aboutWindow: BrowserWindow | null = null;

  const createAuxWindow = (
    path: string,
    title: string,
    width = DEFAULT_SETTINGS_WINDOW_WIDTH,
    height = DEFAULT_SETTINGS_WINDOW_HEIGHT
  ) => {
    const win = new BrowserWindow({
      width,
      height,
      title,
      autoHideMenuBar: true,
      icon,
      parent: mainWindow || undefined,
      modal: false, // Separate window, not modal
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${path}`);
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'), { hash: path });
    }

    return win;
  };

  ipcMain.on('menu-open-settings', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.focus();
      return;
    }
    settingsWindow = createAuxWindow('/settings', 'Preferences');
  });

  ipcMain.on('menu-open-about', () => {
    if (aboutWindow && !aboutWindow.isDestroyed()) {
      aboutWindow.focus();
      return;
    }
    aboutWindow = createAuxWindow(
      '/about',
      'About',
      DEFAULT_ABOUT_WINDOW_WIDTH,
      DEFAULT_ABOUT_WINDOW_HEIGHT
    );
  });

  ipcMain.handle('broadcast-settings-change', (_event, config) => {
    // Update menu language if changed
    if (config.language) {
      setMenu(config.language);
    }
    // Broadcast to all windows
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('settings-changed', config);
    });
  });

  ipcMain.handle('dialog-open-file', async () => {
    if (!mainWindow) return null;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Audio', extensions: ['mp3'] }]
    });
    if (canceled) return null;
    return filePaths;
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
