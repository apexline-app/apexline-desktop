import { z } from '@/shared/ipc/validation';

export const SignInInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type SignInInput = z.infer<typeof SignInInputSchema>;

export const SignInResponseSchema = z.object({
  ok: z.literal(true),
  requires2fa: z.boolean(),
});

export type SignInResponse = z.infer<typeof SignInResponseSchema>;
