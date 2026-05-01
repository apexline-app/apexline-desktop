export type LapSample = {
  lapNumber: number;
  lapTimeMs: number;
  fuel: number;
  speedKmh: number;
  position: number;
};

export type TelemetryMessage =
  | { type: 'connected' }
  | { type: 'disconnected'; reason?: string }
  | { type: 'lap-sample'; sample: LapSample; timestamp: number }
  | { type: 'error'; message: string };

export const TELEMETRY_OPEN_CHANNEL = 'telemetry:open' as const;
