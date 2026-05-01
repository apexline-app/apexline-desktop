import { SettingsKeySchema } from '@/features/settings/contracts/settings';
import { z } from '@/shared/ipc/validation';

export const SettingsGetInputSchema = z.object({
  key: SettingsKeySchema,
});

export type SettingsGetInput = z.infer<typeof SettingsGetInputSchema>;
