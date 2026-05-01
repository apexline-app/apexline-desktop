import { describe, expect, it } from 'vitest';

describe('MSW oauth handlers', () => {
  it('issues tokens for valid password grant', async () => {
    const res = await fetch('http://api.test/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        username: 'daniel@apexline.test',
        password: 'dev',
        client_id: 'apx_desktop',
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as { access_token: string };
    expect(json.access_token).toBe('mock.jwt.access');
  });

  it('returns requires_2fa with challenge_token for 2fa user', async () => {
    const res = await fetch('http://api.test/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        username: '2fa@apexline.test',
        password: 'dev',
      }),
    });

    expect(res.status).toBe(401);
    const json = (await res.json()) as {
      error: string;
      challenge_token: string;
    };
    expect(json.error).toBe('requires_2fa');
    expect(json.challenge_token).toBe('mock-challenge-token');
  });

  it('rejects wrong password with invalid_grant', async () => {
    const res = await fetch('http://api.test/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        username: 'daniel@apexline.test',
        password: 'wrong',
      }),
    });

    expect(res.status).toBe(401);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('invalid_grant');
  });

  it('refreshes token with refresh_token grant', async () => {
    const res = await fetch('http://api.test/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: 'rt_abc',
      }),
    });

    expect(res.status).toBe(200);
  });

  it('verifies 2FA with valid otp', async () => {
    const res = await fetch('http://api.test/api/v1/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challenge_token: 'mock-challenge-token',
        otp_attempt: '123456',
      }),
    });

    expect(res.status).toBe(200);
  });

  it('rejects invalid otp', async () => {
    const res = await fetch('http://api.test/api/v1/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challenge_token: 'mock-challenge-token',
        otp_attempt: '999999',
      }),
    });

    expect(res.status).toBe(401);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('invalid_otp');
  });

  it('rejects expired challenge_token', async () => {
    const res = await fetch('http://api.test/api/v1/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challenge_token: 'expired',
        otp_attempt: '123456',
      }),
    });

    expect(res.status).toBe(401);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('challenge_expired');
  });
});

describe('MSW users handlers', () => {
  it('registers a user', async () => {
    const res = await fetch('http://api.test/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          email: 'new@apexline.test',
          password: 'password123',
          nickname: 'newbie',
        },
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      data: { email: string; nickname: string };
    };
    expect(json.data.email).toBe('new@apexline.test');
    expect(json.data.nickname).toBe('newbie');
  });

  it('returns validation_error for missing fields', async () => {
    const res = await fetch('http://api.test/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { email: 'foo@bar.test' } }),
    });

    expect(res.status).toBe(422);
    const json = (await res.json()) as { _meta: { reason: string } };
    expect(json._meta.reason).toBe('validation_error');
  });
});

describe('MSW me handlers', () => {
  it('rejects /me without bearer', async () => {
    const res = await fetch('http://api.test/api/v1/me');

    expect(res.status).toBe(401);
    const json = (await res.json()) as { _meta: { reason: string } };
    expect(json._meta.reason).toBe('unauthorized');
  });

  it('rejects /me with empty bearer token', async () => {
    const res = await fetch('http://api.test/api/v1/me', {
      headers: { Authorization: 'Bearer  ' },
    });

    expect(res.status).toBe(401);
  });

  it('returns user from /me with bearer', async () => {
    const res = await fetch('http://api.test/api/v1/me', {
      headers: { Authorization: 'Bearer mock.jwt.access' },
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { email: string } };
    expect(json.data.email).toBe('daniel@apexline.test');
  });
});
