import { useMutation } from '@tanstack/react-query';

import type { SignInInput } from '@/features/auth/contracts';

const signIn = async (input: SignInInput) => {
  const result = await window.api.invoke('auth:sign-in', input);
  return { requires2fa: result.requires2fa };
};

/**
 * Embedded ROPC sign-in. On success, main broadcasts `auth:state-changed`
 * which the Zustand store picks up — this mutation does NOT need to
 * update any cache/store itself.
 *
 * Returns `{ requires2fa: boolean }` so the caller can route to
 * `/2fa-challenge` when the user has 2FA enabled.
 */
export const useSignIn = () => useMutation({ mutationFn: signIn });
