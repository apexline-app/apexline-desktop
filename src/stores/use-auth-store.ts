import { useEffect } from 'react';

import { create } from 'zustand';

import type { AuthState, User } from '@/ipc/auth/types';

type Status = AuthState['status'] | 'loading';

type AuthStoreState = {
  status: Status;
  user: User | null;
  setState: (next: AuthState) => void;
  signIn: (input: { email: string; password: string }) => Promise<{
    requires2fa: boolean;
  }>;
  signUp: (input: {
    email: string;
    password: string;
    nickname: string;
  }) => Promise<void>;
  verify2fa: (otp: string) => Promise<void>;
  startGoogleLogin: () => Promise<void>;
  logout: () => Promise<void>;
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
  signIn: async input => {
    const res = await window.api.invoke('auth:sign-in', input);
    return { requires2fa: res.requires2fa };
  },
  signUp: async input => {
    await window.api.invoke('auth:sign-up', input);
  },
  verify2fa: async otp => {
    await window.api.invoke('auth:verify-2fa', { otp });
  },
  startGoogleLogin: async () => {
    await window.api.invoke('auth:start-google-login', undefined);
  },
  logout: async () => {
    await window.api.invoke('auth:logout', undefined);
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
