import { z } from '@/shared/ipc/validation';

export const Verify2faInputSchema = z.object({
  otp: z.string().min(6).max(20),
});

export type Verify2faInput = z.infer<typeof Verify2faInputSchema>;
