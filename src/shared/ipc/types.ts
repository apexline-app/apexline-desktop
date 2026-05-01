import type { AuthCommands, AuthEvents } from '@/features/auth/contracts';
import type {
  SettingsCommands,
  SettingsEvents,
} from '@/features/settings/contracts';
import type { TelemetryMessage } from '@/features/telemetry/contracts';

export type Commands = SettingsCommands & AuthCommands;

export type Events = SettingsEvents & AuthEvents;

export type { TelemetryMessage };
