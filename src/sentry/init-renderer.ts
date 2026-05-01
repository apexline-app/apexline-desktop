import * as Sentry from '@sentry/electron/renderer';

import { beforeSend } from './before-send';

export const initSentryRenderer = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.PROD ? 'production' : 'development',
    tracesSampleRate: 0,
    beforeSend,
  });
};
