import { QueryClient } from '@tanstack/react-query';

const ONE_SECOND = 1_000;

/**
 * Single QueryClient instance for the renderer. Defaults tuned for an
 * Electron desktop app:
 *
 * - `staleTime: 30s` — modest fresh window so navigating between routes
 *   doesn't refetch every endpoint.
 * - `refetchOnWindowFocus: false` — no browser tab-switch behavior in
 *   Electron; user "focusing" the app shouldn't trigger refetches.
 * - `refetchOnReconnect: true` — recover gracefully after network drops.
 * - `retry: 1` — soft retry; the underlying http client (apexline-http-
 *   toolkit-js, when wired) owns exponential backoff for 5xx / 429.
 *
 * Mutations don't auto-retry — caller decides.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * ONE_SECOND,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
