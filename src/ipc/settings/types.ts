import { z } from '@/ipc/validation';

export const SettingsSchema = z.object({
  theme: z.enum(['apexline', 'system']).default('apexline'),
  telemetryHz: z.number().int().min(1).max(120).default(60),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const SettingsKeySchema = SettingsSchema.keyof();
export type SettingsKey = z.infer<typeof SettingsKeySchema>;

export const SettingsGetInputSchema = z.object({
  key: SettingsKeySchema,
});

export const SettingsSetInputSchema = z.discriminatedUnion('key', [
  z.object({ key: z.literal('theme'), value: SettingsSchema.shape.theme }),
  z.object({
    key: z.literal('telemetryHz'),
    value: SettingsSchema.shape.telemetryHz,
  }),
]);

export type SettingsCommands = {
  'settings:get-all': {
    request: void;
    response: Settings;
  };
  'settings:get': {
    request: z.infer<typeof SettingsGetInputSchema>;
    response: Settings[SettingsKey];
  };
  'settings:set': {
    request: z.infer<typeof SettingsSetInputSchema>;
    response: Settings;
  };
};

export type SettingsEvents = {
  'settings:changed': Settings;
};
