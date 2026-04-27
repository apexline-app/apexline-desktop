import { formatLapTime } from '@apexline-app/apr';
import { describe, expect, it } from 'vitest';

describe('vitest smoke', () => {
  it('runs and resolves @apexline-app/apr', () => {
    expect(formatLapTime(83456)).toBe('1:23.456');
  });

  it('resolves @/ alias', async () => {
    const mod = await import('@/test/setup');
    expect(mod).toBeDefined();
  });
});
