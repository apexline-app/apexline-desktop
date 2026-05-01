import { http, HttpResponse } from 'msw';

import { MOCK_TOKENS } from '@/features/auth/mocks/fixtures/user';

const TWO_FA_USER = '2fa@apexline.test';
const VALID_PASSWORD = 'dev';
const VALID_OTP = '123456';
const CHALLENGE_TOKEN = 'mock-challenge-token';

const tokenResponse = () =>
  HttpResponse.json({ ...MOCK_TOKENS }, { status: 200 });

export const oauthHandlers = [
  http.post('*/oauth/token', async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const grantType = params.get('grant_type');

    if (grantType === 'password') {
      const username = params.get('username');
      const password = params.get('password');

      if (username === TWO_FA_USER && password === VALID_PASSWORD) {
        return HttpResponse.json(
          { error: 'requires_2fa', challenge_token: CHALLENGE_TOKEN },
          { status: 401 },
        );
      }
      if (password !== VALID_PASSWORD) {
        return HttpResponse.json({ error: 'invalid_grant' }, { status: 401 });
      }
      return tokenResponse();
    }

    if (grantType === 'refresh_token') {
      const refresh = params.get('refresh_token');
      if (!refresh) {
        return HttpResponse.json({ error: 'invalid_grant' }, { status: 401 });
      }
      return tokenResponse();
    }

    if (grantType === 'authorization_code') {
      return tokenResponse();
    }

    return HttpResponse.json(
      { error: 'unsupported_grant_type' },
      { status: 400 },
    );
  }),

  http.post('*/oauth/revoke', () => HttpResponse.json({}, { status: 200 })),

  http.post('*/api/v1/auth/2fa/verify', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      challenge_token?: string;
      otp_attempt?: string;
    } | null;

    if (body?.challenge_token !== CHALLENGE_TOKEN) {
      return HttpResponse.json({ error: 'challenge_expired' }, { status: 401 });
    }
    if (body?.otp_attempt !== VALID_OTP) {
      return HttpResponse.json({ error: 'invalid_otp' }, { status: 401 });
    }
    return tokenResponse();
  }),

  http.get('*/.well-known/openid-configuration', ({ request }) => {
    const issuer = new URL(request.url).origin;
    return HttpResponse.json({
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      revocation_endpoint: `${issuer}/oauth/revoke`,
      jwks_uri: `${issuer}/oauth/jwks`,
      response_types_supported: ['code'],
      grant_types_supported: [
        'authorization_code',
        'refresh_token',
        'password',
      ],
      code_challenge_methods_supported: ['S256'],
    });
  }),
];
