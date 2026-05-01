import { z } from '@/shared/ipc/validation';

export const SignUpInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  nickname: z.string().min(3).max(30),
});

export type SignUpInput = z.infer<typeof SignUpInputSchema>;
