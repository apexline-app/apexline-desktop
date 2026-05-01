import { meHandlers } from '@/mocks/handlers/me';
import { oauthHandlers } from '@/mocks/handlers/oauth';
import { usersHandlers } from '@/mocks/handlers/users';

export const handlers = [...oauthHandlers, ...usersHandlers, ...meHandlers];
