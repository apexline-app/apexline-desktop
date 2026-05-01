import { BrowserWindow, ipcMain, shell } from 'electron';
import http from 'node:http';

import { withValidation } from '@/ipc/validation';
import { API_PATHS } from '@/lib/api-paths';
import {
  apiBase,
  apiJson,
  apiJsonRaw,
  oauthClientId,
  type OauthTokenResponse,
  postOauthToken,
  revokeToken,
} from '@/lib/auth-fetch';
import {
  deleteEncryptedJson,
  readEncryptedJson,
  writeEncryptedJson,
} from '@/main/encrypted-storage';

import {
  type AuthState,
  SignInInputSchema,
  SignUpInputSchema,
  type User,
  Verify2faInputSchema,
} from './types';

const REFRESH_LEEWAY_MS = 60_000;
const GOOGLE_CALLBACK_TIMEOUT_MS = 120_000;
const AUTH_FILE = 'auth.json';

type InternalAuthState =
  | { status: 'unauthenticated' }
  | { status: 'awaiting-2fa'; challengeToken: string }
  | {
      status: 'authenticated';
      user: User;
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };

let state: InternalAuthState = { status: 'unauthenticated' };

const isMockMode = () => process.env.VITE_API_MODE === 'mock';

const publicState = (s: InternalAuthState): AuthState => {
  switch (s.status) {
    case 'unauthenticated':
      return { status: 'unauthenticated' };
    case 'awaiting-2fa':
      return { status: 'awaiting-2fa' };
    case 'authenticated':
      return { status: 'authenticated', user: s.user };
  }
};

const broadcast = (next: AuthState) => {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('auth:state-changed', next);
  }
};

const persistSession = async (tokens: OauthTokenResponse) => {
  const user = await apiJson<User>(API_PATHS.ME, {
    method: 'GET',
    accessToken: tokens.access_token,
  });
  state = {
    status: 'authenticated',
    user,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
  try {
    writeEncryptedJson(AUTH_FILE, { refresh_token: tokens.refresh_token });
  } catch (err) {
    console.warn('[auth] could not persist refresh token:', err);
  }
  broadcast(publicState(state));
};

const clearSession = () => {
  state = { status: 'unauthenticated' };
  deleteEncryptedJson(AUTH_FILE);
  broadcast(publicState(state));
};

const refreshAccessToken = async () => {
  if (state.status !== 'authenticated') {
    throw new Error('unauthenticated');
  }
  const result = await postOauthToken({
    grant_type: 'refresh_token',
    refresh_token: state.refreshToken,
    client_id: oauthClientId(),
  });
  if (!result.ok) {
    clearSession();
    throw new Error('refresh-expired');
  }
  await persistSession(result.tokens);
};

const startLoopbackServer = () =>
  new Promise<{ server: http.Server; port: number }>(resolve => {
    const server = http.createServer();
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        throw new Error('loopback server failed to bind');
      }
      resolve({ server, port: addr.port });
    });
  });

const waitForCallback = (server: http.Server, expectedState: string) =>
  new Promise<URLSearchParams>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('google-login-timeout'));
    }, GOOGLE_CALLBACK_TIMEOUT_MS);

    server.on('request', (req, res) => {
      if (!req.url?.startsWith('/callback')) {
        res.writeHead(404).end();
        return;
      }
      const url = new URL(req.url, 'http://127.0.0.1');
      const callbackState = url.searchParams.get('state');
      if (callbackState !== expectedState) {
        clearTimeout(timeout);
        res.writeHead(400).end('state mismatch');
        reject(new Error('state-mismatch'));
        return;
      }
      clearTimeout(timeout);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(
        '<html><body style="font-family:system-ui;padding:2rem;background:#0a0a0b;color:#e5e7eb"><h1>Sign-in complete</h1><p>You can close this window and return to Apexline.</p></body></html>',
      );
      resolve(url.searchParams);
    });
  });

const handleSignIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const result = await postOauthToken({
    grant_type: 'password',
    username: email,
    password,
    client_id: oauthClientId(),
    scope: 'profile',
  });

  if (!result.ok && result.error === 'requires_2fa') {
    if (!result.challengeToken) throw new Error('missing challenge_token');
    state = { status: 'awaiting-2fa', challengeToken: result.challengeToken };
    broadcast(publicState(state));
    return { ok: true as const, requires2fa: true };
  }

  if (!result.ok) {
    throw new Error(result.error);
  }

  await persistSession(result.tokens);
  return { ok: true as const, requires2fa: false };
};

const handleVerify2fa = async ({ otp }: { otp: string }) => {
  if (state.status !== 'awaiting-2fa') {
    throw new Error('unauthenticated');
  }
  const tokens = await apiJsonRaw<OauthTokenResponse>(
    API_PATHS.AUTH_2FA_VERIFY,
    {
      method: 'POST',
      body: JSON.stringify({
        challenge_token: state.challengeToken,
        otp_attempt: otp,
      }),
    },
  );
  await persistSession(tokens);
  return { ok: true as const };
};

const handleSignUp = async (input: {
  email: string;
  password: string;
  nickname: string;
}) => {
  await apiJson<User>(API_PATHS.USERS, {
    method: 'POST',
    body: JSON.stringify({ user: input }),
  });
  return { ok: true as const };
};

const handleStartGoogleLogin = async () => {
  if (isMockMode()) {
    await persistSession({
      access_token: 'mock-google-jwt',
      refresh_token: 'mock-google-refresh',
      expires_in: 3600,
    });
    return { ok: true as const };
  }

  const { generators, Issuer } = await import('openid-client');
  const issuer = await Issuer.discover(apiBase());
  const client = new issuer.Client({
    client_id: oauthClientId(),
    redirect_uris: ['http://127.0.0.1'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  });

  const codeVerifier = generators.codeVerifier();
  const csrfState = generators.state();
  const { server, port } = await startLoopbackServer();
  const redirectUri = `http://127.0.0.1:${port}/callback`;

  const authUrl = client.authorizationUrl({
    scope: 'profile',
    code_challenge: generators.codeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    state: csrfState,
    redirect_uri: redirectUri,
  });

  await shell.openExternal(authUrl);
  try {
    const params = await waitForCallback(server, csrfState);
    const tokenSet = await client.callback(
      redirectUri,
      Object.fromEntries(params),
      { code_verifier: codeVerifier, state: csrfState },
    );
    await persistSession({
      access_token: tokenSet.access_token!,
      refresh_token: tokenSet.refresh_token!,
      expires_in: tokenSet.expires_in ?? 3600,
    });
    return { ok: true as const };
  } finally {
    server.close();
  }
};

const handleLogout = async () => {
  if (state.status === 'authenticated') {
    await revokeToken(state.refreshToken).catch(() => {});
  }
  clearSession();
  return { ok: true as const };
};

const bootstrap = async () => {
  const persisted = readEncryptedJson<{ refresh_token: string }>(AUTH_FILE);
  if (!persisted?.refresh_token) return;

  try {
    const result = await postOauthToken({
      grant_type: 'refresh_token',
      refresh_token: persisted.refresh_token,
      client_id: oauthClientId(),
    });
    if (result.ok) {
      await persistSession(result.tokens);
    } else {
      deleteEncryptedJson(AUTH_FILE);
    }
  } catch (err) {
    console.warn('[auth] bootstrap refresh failed:', err);
    deleteEncryptedJson(AUTH_FILE);
  }
};

export const registerAuthHandlers = () => {
  ipcMain.handle(
    'auth:sign-in',
    withValidation(SignInInputSchema, handleSignIn),
  );
  ipcMain.handle(
    'auth:sign-up',
    withValidation(SignUpInputSchema, handleSignUp),
  );
  ipcMain.handle(
    'auth:verify-2fa',
    withValidation(Verify2faInputSchema, handleVerify2fa),
  );
  ipcMain.handle('auth:start-google-login', handleStartGoogleLogin);
  ipcMain.handle('auth:logout', handleLogout);
  ipcMain.handle('auth:get-state', () => publicState(state));
  ipcMain.handle('auth:get-access-token', async () => {
    if (state.status !== 'authenticated') throw new Error('unauthenticated');
    if (state.expiresAt - Date.now() < REFRESH_LEEWAY_MS) {
      await refreshAccessToken();
    }
    if (state.status !== 'authenticated') throw new Error('unauthenticated');
    return state.accessToken;
  });

  void bootstrap();
};
