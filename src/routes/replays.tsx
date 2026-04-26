import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/replays')({
  component: ReplaysPage,
});

function ReplaysPage() {
  return (
    <section className='flex flex-col gap-4'>
      <header className='flex flex-col gap-1'>
        <h2 className='font-display text-2xl text-text-primary'>Replays</h2>
        <p className='text-sm text-text-tertiary'>
          Recorded sessions, lap-by-lap analysis. Coming soon.
        </p>
      </header>
    </section>
  );
}
