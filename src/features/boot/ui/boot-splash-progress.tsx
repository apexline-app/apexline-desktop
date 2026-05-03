import { ProgressBar } from '@apexline-app/apr';

import type { BootSplashPhase } from './boot-splash-stages';

const PROGRESS_CEIL_PCT = 85;

export type BootSplashProgressProps = {
  phase: BootSplashPhase;
  activeIndex: number;
  totalStages: number;
};

export const BootSplashProgress = ({
  phase,
  activeIndex,
  totalStages,
}: BootSplashProgressProps) => {
  const value =
    phase === 'progressing'
      ? totalStages > 0
        ? Math.min(
            Math.max(activeIndex + 1, 0) * (PROGRESS_CEIL_PCT / totalStages),
            PROGRESS_CEIL_PCT,
          )
        : 0
      : 100;

  return (
    <div className='w-[min(440px,80vw)]'>
      <ProgressBar value={value} tone='accent' />
    </div>
  );
};
