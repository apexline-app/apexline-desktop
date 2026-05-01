import { z } from '@/shared/ipc/validation';

export const Verify2faInputSchema = z.object({
  otp: z
    .string()
    .min(6, 'Code must be at least 6 characters.')
    .max(20, 'Code must be at most 20 characters.'),
});

export type Verify2faInput = z.infer<typeof Verify2faInputSchema>;
