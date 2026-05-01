import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <section className='flex flex-col gap-4'>
      <header className='flex flex-col gap-1'>
        <h2 className='font-display text-2xl text-text-primary'>Onboarding</h2>
        <p className='text-sm text-text-tertiary'>
          Welcome flow — profile setup, iRacing connection, preferences.
          Implemented in W3.
        </p>
      </header>
    </section>
  );
}
