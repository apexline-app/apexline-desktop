import { BrowserWindow, ipcMain } from 'electron';

import { withValidation } from '@/ipc/validation';

import {
  type Settings,
  SettingsGetInputSchema,
  SettingsSchema,
  SettingsSetInputSchema,
} from './types';

const state: Settings = SettingsSchema.parse({});

const broadcast = (next: Settings) => {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('settings:changed', next);
  }
};

export const registerSettingsHandlers = () => {
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
      broadcast(state);
      return { ...state };
    }),
  );
};
