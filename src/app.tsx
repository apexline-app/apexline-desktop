import { formatLapTime } from '@apexline-app/apr';

type AppProps = {
  lapMs: number;
};

export const App = ({ lapMs }: AppProps) => {
  return (
    <main
      data-theme='apexline'
      className='flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-primary text-text-primary'
    >
      <h1 className='font-display text-2xl text-brand-primary'>
        Apexline desktop
      </h1>
      <p className='font-mono text-text-secondary'>
        sample lap ({lapMs} ms) →{' '}
        <span className='text-text-primary'>{formatLapTime(lapMs)}</span>
      </p>
    </main>
  );
};
