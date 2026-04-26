import { formatLapTime } from '@apexline-app/apr';

import { useLapTelemetry } from '@/hooks/use-lap-telemetry';
import { useSettings } from '@/hooks/use-settings';

type AppProps = {
  lapMs: number;
};

export const App = ({ lapMs }: AppProps) => {
  const { settings, set } = useSettings();
  const telemetry = useLapTelemetry();

  return (
    <main
      data-theme='apexline'
      className='flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-primary text-text-primary'
    >
      <h1 className='font-display text-2xl text-brand-primary'>
        Apexline desktop
      </h1>

      <p className='font-mono text-text-secondary'>
        sample lap ({lapMs} ms) →{' '}
        <span className='text-text-primary'>{formatLapTime(lapMs)}</span>
      </p>

      <section className='flex flex-col items-center gap-1 text-sm'>
        <span className='text-text-tertiary'>
          settings (round-trip via IPC)
        </span>
        <span className='font-mono'>
          theme:{' '}
          <span className='text-brand-primary'>{settings?.theme ?? '…'}</span> ·
          telemetryHz:{' '}
          <span className='text-brand-primary'>
            {settings?.telemetryHz ?? '…'}
          </span>
        </span>
        <button
          type='button'
          className='rounded-md border border-border-default px-3 py-1 font-mono text-xs hover:bg-bg-secondary'
          onClick={() =>
            set({
              key: 'telemetryHz',
              value: settings?.telemetryHz === 60 ? 120 : 60,
            })
          }
        >
          toggle telemetryHz
        </button>
      </section>

      <section className='flex flex-col items-center gap-1 text-sm'>
        <span className='text-text-tertiary'>
          telemetry stream (MessagePort)
        </span>
        <span className='font-mono'>
          status: <span className='text-brand-primary'>{telemetry.status}</span>
        </span>
        {telemetry.lastSample && (
          <span className='font-mono text-text-secondary'>
            lap {telemetry.lastSample.lapNumber} ·{' '}
            {formatLapTime(telemetry.lastSample.lapTimeMs)}
          </span>
        )}
        {telemetry.lastError && (
          <span className='font-mono text-danger-text'>
            {telemetry.lastError}
          </span>
        )}
      </section>
    </main>
  );
};
