import { createFileRoute } from '@tanstack/react-router';

import { useSettings } from '@/hooks/use-settings';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, set } = useSettings();

  if (!settings) {
    return (
      <p className='font-mono text-sm text-text-tertiary'>loading settings…</p>
    );
  }

  return (
    <section className='flex max-w-xl flex-col gap-6'>
      <header className='flex flex-col gap-1'>
        <h2 className='font-display text-2xl text-text-primary'>Settings</h2>
        <p className='text-sm text-text-tertiary'>
          Persisted to disk in{' '}
          <code className='font-mono'>userData/settings.json</code>.
        </p>
      </header>

      <fieldset className='flex flex-col gap-2 rounded-md border border-border-subtle bg-bg-secondary p-4'>
        <legend className='px-2 text-xs uppercase tracking-wide text-text-tertiary'>
          theme
        </legend>
        <div className='flex gap-2'>
          {(['apexline', 'system'] as const).map(theme => (
            <button
              key={theme}
              type='button'
              onClick={() => set({ key: 'theme', value: theme })}
              className={
                settings.theme === theme
                  ? 'rounded-md border border-brand-primary bg-bg-tertiary px-3 py-1 font-mono text-xs text-brand-primary'
                  : 'rounded-md border border-border-default px-3 py-1 font-mono text-xs hover:bg-bg-tertiary'
              }
            >
              {theme}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className='flex flex-col gap-2 rounded-md border border-border-subtle bg-bg-secondary p-4'>
        <legend className='px-2 text-xs uppercase tracking-wide text-text-tertiary'>
          telemetry rate
        </legend>
        <div className='flex gap-2'>
          {([30, 60, 120] as const).map(hz => (
            <button
              key={hz}
              type='button'
              onClick={() => set({ key: 'telemetryHz', value: hz })}
              className={
                settings.telemetryHz === hz
                  ? 'rounded-md border border-brand-primary bg-bg-tertiary px-3 py-1 font-mono text-xs text-brand-primary'
                  : 'rounded-md border border-border-default px-3 py-1 font-mono text-xs hover:bg-bg-tertiary'
              }
            >
              {hz} Hz
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
