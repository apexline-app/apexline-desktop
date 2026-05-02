import { authMockHandlers } from '@/features/auth/mocks';
import { wrapWithLatency } from '@/mocks/latency';

export const handlers = wrapWithLatency([...authMockHandlers]);
