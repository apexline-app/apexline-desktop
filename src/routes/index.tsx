import { formatLapTime } from '@apexline-app/apr';
import { createFileRoute } from '@tanstack/react-router';

import { useLapTelemetry } from '@/hooks/use-lap-telemetry';

export const Route = createFileRoute('/')({
  component: LivePage,
});

function LivePage() {
  const telemetry = useLapTelemetry();

  return (
    <section className='flex flex-col gap-4'>
      <header className='flex flex-col gap-1'>
        <h2 className='font-display text-2xl text-text-primary'>Live</h2>
        <p className='text-sm text-text-tertiary'>
          Real-time telemetry stream from the iRacing adapter.
        </p>
      </header>

      <div className='flex flex-col gap-2 rounded-md border border-border-subtle bg-bg-secondary p-4'>
        <span className='text-xs uppercase tracking-wide text-text-tertiary'>
          stream status
        </span>
        <span className='font-mono text-sm'>
          <span className='text-brand-primary'>{telemetry.status}</span>
        </span>

        {telemetry.lastSample && (
          <div className='mt-2 flex flex-col gap-1 font-mono text-sm text-text-secondary'>
            <span>
              lap {telemetry.lastSample.lapNumber} ·{' '}
              <span className='text-text-primary'>
                {formatLapTime(telemetry.lastSample.lapTimeMs)}
              </span>
            </span>
            <span>
              fuel {telemetry.lastSample.fuel.toFixed(1)} L · pos{' '}
              {telemetry.lastSample.position}
            </span>
          </div>
        )}

        {telemetry.lastError && (
          <span className='font-mono text-sm text-danger-text'>
            {telemetry.lastError}
          </span>
        )}
      </div>
    </section>
  );
}
