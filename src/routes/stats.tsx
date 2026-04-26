import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/stats')({
  component: StatsPage,
});

function StatsPage() {
  return (
    <section className='flex flex-col gap-4'>
      <header className='flex flex-col gap-1'>
        <h2 className='font-display text-2xl text-text-primary'>Stats</h2>
        <p className='text-sm text-text-tertiary'>
          Aggregated performance over time. Coming soon.
        </p>
      </header>
    </section>
  );
}
