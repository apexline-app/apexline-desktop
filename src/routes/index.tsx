import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <section className='flex flex-col gap-4'>
      <header className='flex flex-col gap-1'>
        <h2 className='font-display text-2xl text-text-primary'>Dashboard</h2>
        <p className='text-sm text-text-tertiary'>
          Recent races, iRating trend, weekly schedule. Implemented in W5.
        </p>
      </header>
    </section>
  );
}
