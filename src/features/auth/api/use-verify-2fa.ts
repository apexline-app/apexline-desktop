import { useMutation } from '@tanstack/react-query';

const verify2fa = (otp: string) =>
  window.api.invoke('auth:verify-2fa', { otp });

/**
 * 2FA challenge verification. Caller passes only the OTP — challenge_token
 * is held in main process state and attached server-side.
 *
 * On `challenge_expired` error: main clears the awaiting-2fa state and
 * broadcasts `auth:state-changed` → Zustand picks it up → router redirects
 * back to `/sign-in`.
 */
export const useVerify2fa = () => useMutation({ mutationFn: verify2fa });
