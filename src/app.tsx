import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { routeTree } from '@/route-tree.gen';

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ['/'] }),
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const App = () => <RouterProvider router={router} />;
