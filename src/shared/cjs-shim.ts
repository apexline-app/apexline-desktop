import * as React from 'react';

import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as JsxRuntime from 'react/jsx-runtime';

const moduleMap: Record<string, unknown> = {
  react: React,
  'react-dom': ReactDOM,
  'react-dom/client': ReactDOMClient,
  'react/jsx-runtime': JsxRuntime,
};

const shim = (id: string): unknown => {
  if (id in moduleMap) return moduleMap[id];
  throw new Error(`[cjs-shim] unsupported require(${JSON.stringify(id)})`);
};

(globalThis as unknown as { require?: unknown }).require ??= shim;
