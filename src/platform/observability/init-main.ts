import * as Sentry from '@sentry/electron/main';
import { app } from 'electron';

import { beforeSend } from './before-send';

export const initSentryMain = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: app.isPackaged ? 'production' : 'development',
    release: app.getVersion(),
    tracesSampleRate: 0,
    beforeSend,
  });
};
