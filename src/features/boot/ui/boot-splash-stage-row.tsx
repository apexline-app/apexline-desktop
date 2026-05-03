import { Spinner, Text } from '@apexline-app/apr';

export type BootSplashStageState = 'pending' | 'active' | 'done';

export type BootSplashStageRowProps = {
  label: string;
  state: BootSplashStageState;
};

const META_BY_STATE: Record<BootSplashStageState, string> = {
  done: 'OK',
  active: '…',
  pending: 'QUEUED',
};

const LABEL_CLASS_BY_STATE: Record<BootSplashStageState, string> = {
  done: 'text-text-primary',
  active: 'text-text-primary',
  pending: 'text-text-tertiary',
};

const META_CLASS_BY_STATE: Record<BootSplashStageState, string> = {
  done: 'text-success-text',
  active: 'text-brand-accent',
  pending: 'text-text-tertiary',
};

export const BootSplashStageRow = ({
  label,
  state,
}: BootSplashStageRowProps) => (
  <div className='flex items-center gap-3.5 font-mono text-xs tracking-[0.04em]'>
    <div className='flex h-4 w-4 shrink-0 items-center justify-center'>
      <BootSplashStageIcon state={state} />
    </div>
    <Text variant='meta' className={`flex-1 ${LABEL_CLASS_BY_STATE[state]}`}>
      {label}
    </Text>
    <Text
      variant='meta'
      className={`text-[10px] tracking-[0.14em] ${META_CLASS_BY_STATE[state]}`}
    >
      {META_BY_STATE[state]}
    </Text>
  </div>
);

const BootSplashStageIcon = ({ state }: { state: BootSplashStageState }) => {
  if (state === 'done') {
    return (
      <svg
        width='14'
        height='14'
        viewBox='0 0 16 16'
        fill='none'
        className='text-success-text'
        aria-hidden='true'
      >
        <path
          d='M3 8.5l3 3 7-7'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    );
  }
  if (state === 'active') {
    return <Spinner size='sm' tone='accent' />;
  }
  return (
    <span className='h-[5px] w-[5px] rounded-full bg-text-tertiary opacity-55' />
  );
};
