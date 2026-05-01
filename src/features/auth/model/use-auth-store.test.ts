import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthState } from '@/features/auth/contracts';

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
});
