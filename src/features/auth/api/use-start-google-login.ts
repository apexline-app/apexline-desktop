import { useMutation } from '@tanstack/react-query';

const startGoogleLogin = () =>
  window.api.invoke('auth:start-google-login', undefined);

/**
 * Triggers RFC 8252 Auth Code + PKCE flow in main: opens system browser,
 * waits for loopback callback, exchanges code for tokens. Long-running
 * (up to 60s timeout) — UI should show pending state.
 */
export const useStartGoogleLogin = () =>
  useMutation({ mutationFn: startGoogleLogin });
