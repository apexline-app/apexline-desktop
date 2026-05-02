import { delay, http, type HttpHandler, type HttpResponseResolver } from 'msw';

type Range = readonly [number, number];

const RANGES: Record<string, Range> = {
  GET: [60, 180],
  POST: [90, 220],
  PUT: [90, 220],
  PATCH: [90, 220],
  DELETE: [80, 180],
};

const DEFAULT_RANGE: Range = [80, 200];

const METHOD_FACTORIES = {
  GET: http.get,
  POST: http.post,
  PUT: http.put,
  PATCH: http.patch,
  DELETE: http.delete,
  HEAD: http.head,
  OPTIONS: http.options,
} as const;

const jitter = ([min, max]: Range) => min + Math.random() * (max - min);

const isLatencyEnabled = () =>
  import.meta.env.MODE !== 'test' &&
  import.meta.env.VITE_MOCK_LATENCY !== 'off';

export const withLatency = (handler: HttpHandler): HttpHandler => {
  const method = String(handler.info.method).toUpperCase();
  const factory =
    METHOD_FACTORIES[method as keyof typeof METHOD_FACTORIES] ?? http.all;
  const range = RANGES[method] ?? DEFAULT_RANGE;
  const original = (handler as unknown as { resolver: HttpResponseResolver })
    .resolver;

  return factory(handler.info.path, async info => {
    await delay(jitter(range));
    return original(info);
  });
};

export const wrapWithLatency = (handlers: HttpHandler[]): HttpHandler[] =>
  isLatencyEnabled() ? handlers.map(withLatency) : handlers;
