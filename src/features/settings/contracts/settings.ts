import { z } from '@/shared/ipc/validation';

export const SettingsSchema = z.object({
  theme: z.enum(['apexline', 'system']).default('apexline'),
  telemetryHz: z.number().int().min(1).max(120).default(60),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const SettingsKeySchema = SettingsSchema.keyof();
export type SettingsKey = z.infer<typeof SettingsKeySchema>;
