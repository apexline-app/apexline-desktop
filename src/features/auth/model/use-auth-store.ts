import { useEffect } from 'react';

import { create } from 'zustand';

import type { AuthState, User } from '@/features/auth/contracts';

type Status = AuthState['status'] | 'loading';

/**
 * Auth client state. Read-only from the renderer's perspective — all
 * state transitions originate in main and arrive via `auth:state-changed`
 * broadcasts. Mutations (sign-in, sign-up, etc.) live in
 * `features/auth/api/` as `useMutation` wrappers.
 */
type AuthStoreState = {
  status: Status;
  user: User | null;
  setState: (next: AuthState) => void;
};

export const useAuthStore = create<AuthStoreState>(set => ({
  status: 'loading',
  user: null,
  setState: next => {
    set(
      next.status === 'authenticated'
        ? { status: 'authenticated', user: next.user }
        : { status: next.status, user: null },
    );
  },
}));

export const useAuthBootstrap = () => {
  const setState = useAuthStore(s => s.setState);

  useEffect(() => {
    let cancelled = false;
    // Subscribe before fetching the initial snapshot — main process can
    // broadcast `auth:state-changed` immediately after a successful
    // bootstrap refresh, and we don't want to miss that event window.
    const unsubscribe = window.api.on('auth:state-changed', setState);
    window.api
      .invoke('auth:get-state', undefined)
      .then(initial => {
        if (!cancelled) setState(initial);
      })
      .catch(() => {
        // IPC failure leaves the store stuck in 'loading'; fall back to
        // unauthenticated so the router can navigate to /sign-in.
        if (!cancelled) setState({ status: 'unauthenticated' });
      });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [setState]);
};
