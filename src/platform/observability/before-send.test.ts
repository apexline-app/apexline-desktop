import type { ErrorEvent } from '@sentry/electron';
import { describe, expect, it } from 'vitest';

import { beforeSend } from './before-send';

const REDACTED = '[REDACTED]';

const errorEvent = (partial: Omit<Partial<ErrorEvent>, 'type'>): ErrorEvent =>
  ({ type: undefined, ...partial }) as ErrorEvent;

describe('beforeSend Sentry scrubber', () => {
  it('redacts Authorization header', () => {
    const event = errorEvent({
      request: {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer abc.def.ghi',
        },
      },
    });

    const result = beforeSend(event);

    expect(result.request?.headers?.['Content-Type']).toBe('application/json');
    expect(result.request?.headers?.Authorization).toBe(REDACTED);
  });

  it('redacts oauth params in request body', () => {
    const event = errorEvent({
      request: {
        data: {
          grant_type: 'authorization_code',
          code: 'abc123',
          code_verifier: 'verifier456',
          state: 'xyz789',
          redirect_uri: 'http://127.0.0.1:1234/callback',
        },
      },
    });

    const result = beforeSend(event);
    const data = result.request?.data as Record<string, unknown>;

    expect(data.grant_type).toBe('authorization_code');
    expect(data.redirect_uri).toBe('http://127.0.0.1:1234/callback');
    expect(data.code).toBe(REDACTED);
    expect(data.code_verifier).toBe(REDACTED);
    expect(data.state).toBe(REDACTED);
  });

  it('redacts tokens nested in extra context', () => {
    const event = errorEvent({
      extra: {
        tokens: {
          access_token: 'eyJ...',
          refresh_token: 'rt_xyz',
          expires_in: 3600,
        },
      },
    });

    const result = beforeSend(event);
    const tokens = (result.extra?.tokens as Record<string, unknown>) ?? {};

    expect(tokens.access_token).toBe(REDACTED);
    expect(tokens.refresh_token).toBe(REDACTED);
    expect(tokens.expires_in).toBe(3600);
  });

  it('redacts password and otp_attempt in form data', () => {
    const event = errorEvent({
      request: {
        data: {
          email: 'user@example.com',
          password: 'hunter2',
          otp_attempt: '123456',
        },
      },
    });

    const result = beforeSend(event);
    const data = result.request?.data as Record<string, unknown>;

    expect(data.email).toBe('user@example.com');
    expect(data.password).toBe(REDACTED);
    expect(data.otp_attempt).toBe(REDACTED);
  });

  it('redacts user PII (email, username, ip_address)', () => {
    const event = errorEvent({
      user: {
        id: 'usr_a1b2c3',
        email: 'user@example.com',
        username: 'racer42',
        ip_address: '192.168.1.1',
      },
    });

    const result = beforeSend(event);

    expect(result.user?.id).toBe('usr_a1b2c3');
    expect(result.user?.email).toBe(REDACTED);
    expect(result.user?.username).toBe(REDACTED);
    expect(result.user?.ip_address).toBe(REDACTED);
  });

  it('redacts sensitive query string params', () => {
    const event = errorEvent({
      request: {
        query_string: 'page=1&code=secret&state=xyz&sort=desc',
      },
    });

    const result = beforeSend(event);
    const params = new URLSearchParams(result.request?.query_string ?? '');

    expect(params.get('page')).toBe('1');
    expect(params.get('sort')).toBe('desc');
    expect(params.get('code')).toBe(REDACTED);
    expect(params.get('state')).toBe(REDACTED);
  });

  it('redacts sensitive data in breadcrumbs', () => {
    const event = errorEvent({
      breadcrumbs: [
        {
          category: 'fetch',
          data: {
            url: 'https://api.apexline.app/oauth/token',
            method: 'POST',
            access_token: 'leaked',
          },
        },
      ],
    });

    const result = beforeSend(event);
    const crumbData = result.breadcrumbs?.[0]?.data as Record<string, unknown>;

    expect(crumbData.url).toBe('https://api.apexline.app/oauth/token');
    expect(crumbData.method).toBe('POST');
    expect(crumbData.access_token).toBe(REDACTED);
  });

  it('handles deeply nested objects without infinite recursion', () => {
    const cyclic: Record<string, unknown> = { name: 'root' };
    cyclic.self = cyclic;

    const event = errorEvent({ extra: { cyclic } });

    expect(() => beforeSend(event)).not.toThrow();
  });

  it('preserves non-sensitive fields untouched', () => {
    const event = errorEvent({
      request: {
        data: {
          nickname: 'speedracer',
          timezone: 'Europe/Warsaw',
          units: 'metric',
        },
      },
    });

    const result = beforeSend(event);
    const data = result.request?.data as Record<string, unknown>;

    expect(data.nickname).toBe('speedracer');
    expect(data.timezone).toBe('Europe/Warsaw');
    expect(data.units).toBe('metric');
  });
});
