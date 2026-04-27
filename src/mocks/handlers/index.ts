import { authHandlers } from '@/mocks/handlers/auth';
import { meHandlers } from '@/mocks/handlers/me';

export const handlers = [...authHandlers, ...meHandlers];
