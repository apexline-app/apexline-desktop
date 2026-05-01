import { useEffect, useState } from 'react';

import type { LapSample } from '@/features/telemetry/contracts';

type TelemetryStatus = 'idle' | 'connected' | 'disconnected' | 'error';

type State = {
  status: TelemetryStatus;
  lastSample: LapSample | null;
  lastError: string | null;
};

const initial: State = {
  status: 'idle',
  lastSample: null,
  lastError: null,
};

export const useLapTelemetry = () => {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    const unsubscribe = window.api.subscribeTelemetry(msg => {
      switch (msg.type) {
        case 'connected':
          setState(prev => ({ ...prev, status: 'connected', lastError: null }));
          break;
        case 'disconnected':
          setState(prev => ({ ...prev, status: 'disconnected' }));
          break;
        case 'lap-sample':
          setState(prev => ({ ...prev, lastSample: msg.sample }));
          break;
        case 'error':
          setState(prev => ({
            ...prev,
            status: 'error',
            lastError: msg.message,
          }));
          break;
      }
    });

    return unsubscribe;
  }, []);

  return state;
};
