import { meHandlers } from './me';
import { oauthHandlers } from './oauth';
import { usersHandlers } from './users';

export const authMockHandlers = [
  ...oauthHandlers,
  ...usersHandlers,
  ...meHandlers,
];
