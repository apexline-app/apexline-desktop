import { useEffect } from 'react';

import { create } from 'zustand';

import type { AuthState, User } from '@/features/auth/contracts';

type Status = AuthState['status'] | 'loading';

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
    // subscribe before fetch — main may broadcast immediately after refresh
    const unsubscribe = window.api.on('auth:state-changed', setState);
    window.api
      .invoke('auth:get-state', undefined)
      .then(initial => {
        if (!cancelled) setState(initial);
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unauthenticated' });
      });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [setState]);
};
