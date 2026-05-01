import { z } from '@/shared/ipc/validation';

export const SignInInputSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export type SignInInput = z.infer<typeof SignInInputSchema>;

export const SignInResponseSchema = z.object({
  ok: z.literal(true),
  requires2fa: z.boolean(),
});

export type SignInResponse = z.infer<typeof SignInResponseSchema>;
