import { API_PATHS } from '@/shared/api/api-paths';

const AUTH_FETCH_TIMEOUT_MS = 15_000;

export const apiBase = () =>
  process.env.APEXLINE_API_URL ?? 'http://localhost:3000';

export const oauthClientId = () => process.env.OAUTH_CLIENT_ID ?? 'apx_desktop';

export const fetchWithTimeout = async (input: string, init: RequestInit) => {
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
 * POST /oauth/token — Doorkeeper RFC response (NOT enveloped).
 * Returns a discriminated union instead of throwing — 401 with `requires_2fa`
 * is a legitimate response that callers must handle differently than an error.
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
