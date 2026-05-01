import { UserSchema } from '@/features/auth/contracts/user';
import { z } from '@/shared/ipc/validation';

export const AuthStateSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('unauthenticated') }),
  z.object({ status: z.literal('awaiting-2fa') }),
  z.object({ status: z.literal('authenticated'), user: UserSchema }),
]);

export type AuthState = z.infer<typeof AuthStateSchema>;
