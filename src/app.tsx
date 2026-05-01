import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { routeTree } from '@/route-tree.gen';
import { createQueryClient } from '@/shared/api/query-client';

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

const queryClient = createQueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    {import.meta.env.DEV && (
      <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-right' />
    )}
  </QueryClientProvider>
);
