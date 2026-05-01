/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: 'mock' | 'hybrid' | 'real';
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_APEXLINE_API_URL?: string;
  readonly VITE_OAUTH_CLIENT_ID?: string;
}
