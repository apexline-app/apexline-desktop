import type { AuthCommands, AuthEvents } from './auth/types';
import type { SettingsCommands, SettingsEvents } from './settings/types';
import type { TelemetryMessage } from './telemetry/types';

export type Commands = SettingsCommands & AuthCommands;

export type Events = SettingsEvents & AuthEvents;

export type { TelemetryMessage };
