import { z } from '@/shared/ipc/validation';

/**
 * Shared trivial response shape used by mutations that don't return data
 * (sign-up, verify-2fa, start-google-login, logout).
 */
export const OkResponseSchema = z.object({
  ok: z.literal(true),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;
