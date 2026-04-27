export type ApiMode = 'mock' | 'hybrid' | 'real';

const VALID_MODES = new Set<ApiMode>(['mock', 'hybrid', 'real']);

function resolveApiMode(): ApiMode {
  const fromEnv = import.meta.env.VITE_API_MODE;
  if (fromEnv && VALID_MODES.has(fromEnv)) {
    return fromEnv;
  }
  return import.meta.env.DEV ? 'mock' : 'real';
}

export const API_MODE: ApiMode = resolveApiMode();
