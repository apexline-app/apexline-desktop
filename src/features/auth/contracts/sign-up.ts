import { z } from '@/shared/ipc/validation';

export const SignUpInputSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  nickname: z
    .string()
    .min(3, 'Nickname must be at least 3 characters.')
    .max(30, 'Nickname must be at most 30 characters.'),
});

export type SignUpInput = z.infer<typeof SignUpInputSchema>;
