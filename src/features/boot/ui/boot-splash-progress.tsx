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
  const segmentPct = PROGRESS_CEIL_PCT / totalStages;
  const value =
    phase === 'progressing'
      ? Math.min((activeIndex + 1) * segmentPct, PROGRESS_CEIL_PCT)
      : 100;

  return (
    <div className='w-[min(440px,80vw)]'>
      <ProgressBar value={value} tone='accent' />
    </div>
  );
};
