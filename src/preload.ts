import { contextBridge, ipcRenderer } from 'electron';

import {
  TELEMETRY_OPEN_CHANNEL,
  type TelemetryMessage,
} from '@/features/telemetry/contracts';
import type { Commands, Events } from '@/shared/ipc/types';

const api = {
  invoke: <K extends keyof Commands>(
    channel: K,
    payload: Commands[K]['request'],
  ): Promise<Commands[K]['response']> =>
    ipcRenderer.invoke(channel, payload) as Promise<Commands[K]['response']>,

  on: <K extends keyof Events>(
    channel: K,
    listener: (payload: Events[K]) => void,
  ) => {
    const wrapped = (_event: Electron.IpcRendererEvent, payload: Events[K]) =>
      listener(payload);
    ipcRenderer.on(channel, wrapped);
    return () => {
      ipcRenderer.removeListener(channel, wrapped);
    };
  },

  subscribeTelemetry: (listener: (msg: TelemetryMessage) => void) => {
    const channel = new MessageChannel();
    ipcRenderer.postMessage(TELEMETRY_OPEN_CHANNEL, null, [channel.port2]);
    channel.port1.onmessage = event => listener(event.data as TelemetryMessage);
    channel.port1.start();
    return () => {
      channel.port1.close();
    };
  },
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
