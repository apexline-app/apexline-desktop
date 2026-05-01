import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/whats-new')({
  component: WhatsNewPage,
});

function WhatsNewPage() {
  return (
    <section className='flex flex-col gap-4'>
      <header className='flex flex-col gap-1'>
        <h2 className='font-display text-2xl text-text-primary'>
          What&apos;s new
        </h2>
        <p className='text-sm text-text-tertiary'>
          Release notes and product updates.
        </p>
      </header>
    </section>
  );
}
