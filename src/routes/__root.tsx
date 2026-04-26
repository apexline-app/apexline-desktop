import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

const NAV_ITEMS = [
  { to: '/', label: 'Live' },
  { to: '/replays', label: 'Replays' },
  { to: '/stats', label: 'Stats' },
  { to: '/settings', label: 'Settings' },
] as const;

export const Route = createRootRoute({
  component: AppShell,
});

function AppShell() {
  return (
    <div
      data-theme='apexline'
      className='flex h-screen bg-bg-primary text-text-primary'
    >
      <aside className='flex w-48 flex-col gap-1 border-r border-border-subtle bg-bg-secondary p-4'>
        <h1 className='mb-4 px-3 font-display text-lg text-brand-primary'>
          Apexline
        </h1>
        <nav className='flex flex-col gap-1' aria-label='Primary'>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className='rounded-md px-3 py-2 font-mono text-sm text-text-secondary hover:bg-bg-tertiary'
              activeProps={{
                className:
                  'rounded-md px-3 py-2 font-mono text-sm bg-bg-tertiary text-brand-primary',
              }}
              activeOptions={{ exact: item.to === '/' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className='flex-1 overflow-auto p-8'>
        <Outlet />
      </main>
    </div>
  );
}
