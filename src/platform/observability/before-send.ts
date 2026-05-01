import type { ErrorEvent } from '@sentry/electron';

const SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'set-cookie',
  'access_token',
  'accesstoken',
  'refresh_token',
  'refreshtoken',
  'id_token',
  'idtoken',
  'code',
  'code_verifier',
  'codeverifier',
  'code_challenge',
  'codechallenge',
  'state',
  'jti',
  'password',
  'password_confirmation',
  'passwordconfirmation',
  'otp',
  'otp_attempt',
  'otp_secret',
  'otp_backup_codes',
] as const;

const REDACTED = '[REDACTED]';

const isSensitiveKey = (key: string) => {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some(sensitive => lower.includes(sensitive));
};

const scrub = (value: unknown, depth = 0): unknown => {
  if (depth > 6 || value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map(item => scrub(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key] = isSensitiveKey(key) ? REDACTED : scrub(val, depth + 1);
  }
  return result;
};

export const beforeSend = (event: ErrorEvent): ErrorEvent => {
  if (event.request) {
    if (event.request.headers) {
      event.request.headers = scrub(event.request.headers) as Record<
        string,
        string
      >;
    }
    if (event.request.data) {
      event.request.data = scrub(event.request.data);
    }
    if (event.request.cookies) {
      event.request.cookies = scrub(event.request.cookies) as Record<
        string,
        string
      >;
    }
    if (
      event.request.query_string &&
      typeof event.request.query_string === 'string'
    ) {
      event.request.query_string = scrubQueryString(event.request.query_string);
    }
  }

  if (event.extra) {
    event.extra = scrub(event.extra) as Record<string, unknown>;
  }

  if (event.contexts) {
    event.contexts = scrub(event.contexts) as ErrorEvent['contexts'];
  }

  if (event.user) {
    if (event.user.email) event.user.email = REDACTED;
    if (event.user.username) event.user.username = REDACTED;
    if (event.user.ip_address) event.user.ip_address = REDACTED;
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(crumb => ({
      ...crumb,
      data: crumb.data
        ? (scrub(crumb.data) as Record<string, unknown>)
        : crumb.data,
    }));
  }

  return event;
};

const scrubQueryString = (qs: string) => {
  const params = new URLSearchParams(qs);
  for (const key of params.keys()) {
    if (isSensitiveKey(key)) params.set(key, REDACTED);
  }
  return params.toString();
};
