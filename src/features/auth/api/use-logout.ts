import { useMutation, useQueryClient } from '@tanstack/react-query';

const logout = () => window.api.invoke('auth:logout', undefined);

/**
 * Logout: revokes tokens (best-effort) and clears safeStorage. Main
 * broadcasts `auth:state-changed` → Zustand status flips to
 * 'unauthenticated'. We additionally clear the entire React Query cache
 * so cached server data from the previous session never leaks into a
 * subsequent sign-in.
 */
export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => qc.clear(),
  });
};
