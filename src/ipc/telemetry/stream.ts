import { ipcMain, type MessagePortMain } from 'electron';

import { TELEMETRY_OPEN_CHANNEL, type TelemetryMessage } from './types';

type Disposer = () => void;

type TelemetrySource = (emit: (msg: TelemetryMessage) => void) => Disposer;

const noopSource: TelemetrySource = emit => {
  emit({ type: 'connected' });
  return () => emit({ type: 'disconnected', reason: 'no-source' });
};

let activeSource: TelemetrySource = noopSource;

export const setTelemetrySource = (source: TelemetrySource) => {
  activeSource = source;
};

export const registerTelemetryStream = () => {
  ipcMain.on(TELEMETRY_OPEN_CHANNEL, event => {
    const [port] = event.ports;
    if (!port) {
      throw new Error(`${TELEMETRY_OPEN_CHANNEL} called without MessagePort`);
    }
    attachPort(port);
  });
};

const attachPort = (port: MessagePortMain) => {
  const send = (msg: TelemetryMessage) => {
    try {
      port.postMessage(msg);
    } catch {
      // Port closed mid-send; ignore.
    }
  };

  const dispose = activeSource(send);

  port.on('close', () => {
    dispose();
  });

  port.start();
};
