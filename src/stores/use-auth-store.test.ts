import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthState } from '@/ipc/auth/types';

import { useAuthStore } from './use-auth-store';

type MockApi = {
  invoke: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
};

const mockUser = {
  pid: 'usr_test',
  email: 'test@apexline.test',
  nickname: 'tester',
};

beforeEach(() => {
  const api: MockApi = {
    invoke: vi.fn(),
    on: vi.fn(() => () => {}),
  };
  (globalThis as unknown as { window: { api: MockApi } }).window = { api };

  useAuthStore.setState({ status: 'loading', user: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const getApi = () =>
  (globalThis as unknown as { window: { api: MockApi } }).window.api;

describe('useAuthStore', () => {
  it('starts in loading state with no user', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.status).toBe('loading');
    expect(result.current.user).toBeNull();
  });

  it('setState transitions to authenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    const next: AuthState = { status: 'authenticated', user: mockUser };

    act(() => {
      result.current.setState(next);
    });

    expect(result.current.status).toBe('authenticated');
    expect(result.current.user).toEqual(mockUser);
  });

  it('setState clears user on unauthenticated', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setState({ status: 'authenticated', user: mockUser });
    });
    act(() => {
      result.current.setState({ status: 'unauthenticated' });
    });

    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });

  it('setState clears user on awaiting-2fa', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setState({ status: 'authenticated', user: mockUser });
    });
    act(() => {
      result.current.setState({ status: 'awaiting-2fa' });
    });

    expect(result.current.status).toBe('awaiting-2fa');
    expect(result.current.user).toBeNull();
  });

  it('signIn forwards to IPC and returns requires2fa', async () => {
    getApi().invoke.mockResolvedValue({ ok: true, requires2fa: true });
    const { result } = renderHook(() => useAuthStore());

    const res = await result.current.signIn({
      email: 'a@b.test',
      password: 'pwd',
    });

    expect(getApi().invoke).toHaveBeenCalledWith('auth:sign-in', {
      email: 'a@b.test',
      password: 'pwd',
    });
    expect(res.requires2fa).toBe(true);
  });

  it('signUp forwards to IPC', async () => {
    getApi().invoke.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useAuthStore());

    await result.current.signUp({
      email: 'new@b.test',
      password: 'password',
      nickname: 'newbie',
    });

    expect(getApi().invoke).toHaveBeenCalledWith('auth:sign-up', {
      email: 'new@b.test',
      password: 'password',
      nickname: 'newbie',
    });
  });

  it('verify2fa forwards otp to IPC', async () => {
    getApi().invoke.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useAuthStore());

    await result.current.verify2fa('123456');

    expect(getApi().invoke).toHaveBeenCalledWith('auth:verify-2fa', {
      otp: '123456',
    });
  });

  it('startGoogleLogin invokes IPC', async () => {
    getApi().invoke.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useAuthStore());

    await result.current.startGoogleLogin();

    expect(getApi().invoke).toHaveBeenCalledWith(
      'auth:start-google-login',
      undefined,
    );
  });

  it('logout invokes IPC', async () => {
    getApi().invoke.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useAuthStore());

    await result.current.logout();

    expect(getApi().invoke).toHaveBeenCalledWith('auth:logout', undefined);
  });
});
