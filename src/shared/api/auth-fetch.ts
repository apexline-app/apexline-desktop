import { API_PATHS } from '@/shared/api/api-paths';

const AUTH_FETCH_TIMEOUT_MS = 15_000;

export const apiBase = () =>
  process.env.APEXLINE_API_URL ?? 'http://localhost:3000';

export const oauthClientId = () => process.env.OAUTH_CLIENT_ID ?? 'apx_desktop';

const fetchWithTimeout = async (input: string, init: RequestInit) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

export type OauthTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
};

export type OauthErrorBody = {
  error: string;
  challenge_token?: string;
};

export type OauthTokenResult =
  | { ok: true; tokens: OauthTokenResponse }
  | { ok: false; status: number; error: string; challengeToken?: string };

/**
 * POST /oauth/token — Doorkeeper RFC response (NIE envelope).
 * Zwraca discriminated union zamiast throwowania, bo 401 z `requires_2fa`
 * to legalna odpowiedź którą caller musi obsłużyć inaczej niż błąd.
 */
export const postOauthToken = async (
  params: Record<string, string>,
): Promise<OauthTokenResult> => {
  const res = await fetchWithTimeout(`${apiBase()}${API_PATHS.OAUTH_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

  if (res.ok) {
    return { ok: true, tokens: (await res.json()) as OauthTokenResponse };
  }

  const body = (await res.json().catch(() => ({}))) as OauthErrorBody;
  return {
    ok: false,
    status: res.status,
    error: body.error ?? 'invalid_grant',
    challengeToken: body.challenge_token,
  };
};

/** POST /oauth/revoke — best-effort, ignores response. */
export const revokeToken = async (refreshToken: string) => {
  await fetchWithTimeout(`${apiBase()}${API_PATHS.OAUTH_REVOKE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      token: refreshToken,
      client_id: oauthClientId(),
    }),
  });
};

type EnvelopeResponse<T> = { data: T };
type ErrorBody = { error?: string; _meta?: { reason?: string } };

type RequestInitWithAuth = RequestInit & { accessToken?: string };

const buildHeaders = (init?: RequestInitWithAuth) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (init?.accessToken) {
    headers.Authorization = `Bearer ${init.accessToken}`;
  }
  return headers;
};

const extractReason = (body: ErrorBody) =>
  body.error ?? body._meta?.reason ?? 'request_failed';

/**
 * Apexline API endpoint with envelope shape `{ data, _meta }`.
 * Throws Error(reason) on non-2xx. Returns parsed `data`.
 *
 * After toolkit-js install: replace with `httpClient.{get,post}(path, ...)`.
 */
export const apiJson = async <T>(
  path: string,
  init?: RequestInitWithAuth,
): Promise<T> => {
  const res = await fetchWithTimeout(`${apiBase()}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });
  const body = (await res.json().catch(() => ({}))) as
    | EnvelopeResponse<T>
    | ErrorBody;
  if (!res.ok) throw new Error(extractReason(body as ErrorBody));
  return (body as EnvelopeResponse<T>).data;
};

/**
 * Non-envelope endpoint (Doorkeeper-style raw response, e.g. token endpoints).
 * Throws Error(reason) on non-2xx. Returns whole body.
 */
export const apiJsonRaw = async <T>(
  path: string,
  init?: RequestInitWithAuth,
): Promise<T> => {
  const res = await fetchWithTimeout(`${apiBase()}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });
  const body = (await res.json().catch(() => ({}))) as T | ErrorBody;
  if (!res.ok) throw new Error(extractReason(body as ErrorBody));
  return body as T;
};
