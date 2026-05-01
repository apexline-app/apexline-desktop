import { BrowserWindow, ipcMain } from 'electron';

import {
  type Settings,
  SettingsGetInputSchema,
  SettingsSchema,
  SettingsSetInputSchema,
} from '@/features/settings/contracts';
import { readJson, writeJson } from '@/platform/storage/file-storage';
import { withValidation } from '@/shared/ipc/validation';

const SETTINGS_FILE = 'settings.json';

const broadcast = (next: Settings) => {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('settings:changed', next);
  }
};

export const registerSettingsHandlers = () => {
  const state: Settings = readJson(SETTINGS_FILE, SettingsSchema);

  const persist = () => writeJson(SETTINGS_FILE, state);

  ipcMain.handle('settings:get-all', () => state);

  ipcMain.handle(
    'settings:get',
    withValidation(SettingsGetInputSchema, ({ key }) => state[key]),
  );

  ipcMain.handle(
    'settings:set',
    withValidation(SettingsSetInputSchema, input => {
      switch (input.key) {
        case 'theme':
          state.theme = input.value;
          break;
        case 'telemetryHz':
          state.telemetryHz = input.value;
          break;
      }
      persist();
      broadcast(state);
      return { ...state };
    }),
  );
};
