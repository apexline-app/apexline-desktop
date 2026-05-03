import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import windowStateKeeper from 'electron-window-state';
import path from 'node:path';

import { registerAuthHandlers } from '@/features/auth/main/handler';
import { registerSettingsHandlers } from '@/features/settings/main/handler';
import { registerTelemetryStream } from '@/features/telemetry/main/stream';
import { initSentryMain } from '@/platform/observability/init-main';

initSentryMain();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const windowState = windowStateKeeper({
    defaultWidth: 1920,
    defaultHeight: 1080,
  });

  const mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#0a0a0b',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    titleBarOverlay:
      process.platform === 'darwin'
        ? false
        : {
            color: '#111113',
            symbolColor: '#e5e7eb',
            height: 36,
          },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  windowState.manage(mainWindow);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL && !process.env.PLAYWRIGHT) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const startMockServer = async () => {
  if (process.env.VITE_API_MODE !== 'mock') return;
  const { server } = await import('@/mocks/node');
  server.listen({ onUnhandledRequest: 'bypass' });
  console.info('[msw] main process mock server started');
};

app.on('ready', async () => {
  await startMockServer();
  registerSettingsHandlers();
  registerTelemetryStream();
  registerAuthHandlers();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
