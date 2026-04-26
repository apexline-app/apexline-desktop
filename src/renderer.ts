import { createElement, StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { App } from './app';
import './index.css';
import './styles.css';

const rootEl = document.createElement('div');
rootEl.id = 'root';
document.body.replaceChildren(rootEl);

createRoot(rootEl).render(
  createElement(StrictMode, null, createElement(App, { lapMs: 72500 })),
);
