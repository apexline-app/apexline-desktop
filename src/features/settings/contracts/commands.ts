import type { SettingsGetInput } from '@/features/settings/contracts/get-settings';
import type { SettingsSetInput } from '@/features/settings/contracts/set-settings';
import type {
  Settings,
  SettingsKey,
} from '@/features/settings/contracts/settings';

export type SettingsCommands = {
  'settings:get-all': { request: void; response: Settings };
  'settings:get': {
    request: SettingsGetInput;
    response: Settings[SettingsKey];
  };
  'settings:set': { request: SettingsSetInput; response: Settings };
};

export type SettingsEvents = {
  'settings:changed': Settings;
};
