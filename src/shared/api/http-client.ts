import {
  createHttpClient,
  type HttpClient,
} from '@apexline-app/http-toolkit-js/http';
import { app } from 'electron';

import { apiBase } from '@/shared/api/auth-fetch';

export type ApiClientDeps = {
  getToken: () => string | null;
  onUnauthorized: () => Promise<string | null>;
};

let instance: HttpClient | null = null;

export const initApiClient = (deps: ApiClientDeps): HttpClient => {
  if (instance) throw new Error('api-client-already-initialized');
  instance = createHttpClient({
    baseUrl: apiBase(),
    appVersion: app.getVersion(),
    getToken: deps.getToken,
    onUnauthorized: deps.onUnauthorized,
  });
  return instance;
};

export const getApiClient = (): HttpClient => {
  if (!instance) throw new Error('api-client-not-initialized');
  return instance;
};
