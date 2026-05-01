import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

type NavItem =
  | { to: '/' | '/onboarding' | '/settings' | '/whats-new'; label: string }
  | { label: string; locked: true };

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/', label: 'Dashboard' },
  { to: '/onboarding', label: 'Onboarding' },
  { to: '/settings', label: 'Settings' },
  { to: '/whats-new', label: "What's new" },
  { label: 'Pit Wall', locked: true },
];

export const Route = createRootRoute({
  component: AppShell,
});

function AppShell() {
  return (
    <div
      data-theme='apexline'
      className='flex h-full flex-col bg-bg-primary text-text-primary'
    >
      <TopBar />

      <div className='flex flex-1 overflow-hidden'>
        <aside className='flex w-48 flex-col gap-1 border-r border-border-subtle bg-bg-secondary p-4'>
          <nav className='flex flex-col gap-1' aria-label='Primary'>
            {NAV_ITEMS.map(item =>
              'locked' in item ? (
                <span
                  key={item.label}
                  aria-disabled='true'
                  className='flex items-center justify-between rounded-md px-3 py-2 font-mono text-sm text-text-tertiary'
                  title='Coming in v1.1'
                >
                  <span>{item.label}</span>
                  <span className='rounded-sm border border-border-subtle px-1.5 text-[10px] uppercase tracking-wide'>
                    soon
                  </span>
                </span>
              ) : (
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
              ),
            )}
          </nav>
        </aside>

        <main className='flex-1 overflow-auto p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header
      className='flex h-9 shrink-0 items-center border-b border-border-subtle bg-bg-secondary px-4'
      style={
        {
          WebkitAppRegion: 'drag',
        } as React.CSSProperties
      }
    >
      <span className='font-display text-sm tracking-wide text-brand-primary'>
        Apexline
      </span>
    </header>
  );
}
