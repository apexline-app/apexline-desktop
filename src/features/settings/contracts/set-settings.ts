import { SettingsSchema } from '@/features/settings/contracts/settings';
import { z } from '@/shared/ipc/validation';

export const SettingsSetInputSchema = z.discriminatedUnion('key', [
  z.object({ key: z.literal('theme'), value: SettingsSchema.shape.theme }),
  z.object({
    key: z.literal('telemetryHz'),
    value: SettingsSchema.shape.telemetryHz,
  }),
]);

export type SettingsSetInput = z.infer<typeof SettingsSetInputSchema>;
