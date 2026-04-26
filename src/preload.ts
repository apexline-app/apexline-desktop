import { contextBridge, ipcRenderer } from 'electron';

import { TELEMETRY_OPEN_CHANNEL } from '@/ipc/telemetry/types';
import type { Commands, Events } from '@/ipc/types';

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

  openTelemetryStream: (): MessagePort => {
    const channel = new MessageChannel();
    ipcRenderer.postMessage(TELEMETRY_OPEN_CHANNEL, null, [channel.port2]);
    return channel.port1;
  },
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
