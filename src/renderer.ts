import { createElement, StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { API_MODE } from '@/lib/api-mode';

import { App } from './app';
import './index.css';
import './styles.css';

async function startMocks() {
  if (API_MODE === 'real') return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}

async function bootstrap() {
  try {
    await startMocks();
  } catch (error) {
    console.error('[msw] failed to start mock worker:', error);
  }

  const rootEl = document.createElement('div');
  rootEl.id = 'root';
  document.body.replaceChildren(rootEl);

  createRoot(rootEl).render(
    createElement(StrictMode, null, createElement(App)),
  );
}

void bootstrap();
