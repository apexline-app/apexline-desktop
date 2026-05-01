export const API_PATHS = {
  OAUTH_TOKEN: '/oauth/token',
  OAUTH_REVOKE: '/oauth/revoke',
  AUTH_2FA_VERIFY: '/api/v1/auth/2fa/verify',
  USERS: '/api/v1/users',
  ME: '/api/v1/me',
  OIDC_DISCOVERY: '/.well-known/openid-configuration',
} as const;

export type ApiPath = (typeof API_PATHS)[keyof typeof API_PATHS];
