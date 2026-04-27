import { describe, expect, it } from 'vitest';

describe('MSW handlers', () => {
  it('logs in with valid credentials', async () => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.test', password: 'secret' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result).toBe('success');
    expect(json.data.access_token).toBe('mock.jwt.access');
    expect(json.data.user.email).toBe('daniel@apexline.test');
  });

  it('returns validation error for missing fields on login', async () => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'secret' }),
    });

    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.result).toBe('error');
    expect(json._meta.reason).toBe('validation_error');
    expect(json._meta.errors.email).toEqual(["can't be blank"]);
  });

  it('registers a user and echoes email + nickname back', async () => {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@apexline.test',
        password: 'secret',
        nickname: 'newbie',
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.user.email).toBe('new@apexline.test');
    expect(json.data.user.nickname).toBe('newbie');
  });

  it('refresh returns new tokens', async () => {
    const res = await fetch('/api/v1/auth/refresh', { method: 'POST' });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.access_token).toBe('mock.jwt.access');
  });

  it('rejects /me without bearer', async () => {
    const res = await fetch('/api/v1/me');

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json._meta.reason).toBe('unauthorized');
  });

  it('returns user from /me with bearer', async () => {
    const res = await fetch('/api/v1/me', {
      headers: { Authorization: 'Bearer mock.jwt.access' },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.email).toBe('daniel@apexline.test');
  });
});
