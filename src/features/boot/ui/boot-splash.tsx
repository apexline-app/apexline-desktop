import { useBootSplash } from '@/features/boot/model/use-boot-splash';

import { BootSplashBottomHud } from './boot-splash-bottom-hud';
import { BootSplashGrid } from './boot-splash-grid';
import { BootSplashMark } from './boot-splash-mark';
import { BootSplashProgress } from './boot-splash-progress';
import { type BootSplashStage, BootSplashStages } from './boot-splash-stages';
import { BootSplashTopHud } from './boot-splash-top-hud';
import './boot-splash.css';

export type BootSplashProps = {
  version?: string;
  tagline?: string;
  stages?: ReadonlyArray<BootSplashStage>;
  minHoldMs?: number;
  done?: boolean;
  onDismissed?: () => void;
};

const DEFAULT_STAGES: ReadonlyArray<BootSplashStage> = [
  { id: 'connect', label: 'Connecting to Apexline' },
  { id: 'schedule', label: 'Syncing iRacing schedule' },
  { id: 'results', label: 'Loading recent results & iRating' },
  { id: 'dashboard', label: 'Preparing dashboard' },
];

const DEFAULT_MIN_HOLD_MS = 3_200;
const COMPLETING_HOLD_MS = 520;
const DISMISS_TRANSITION_MS = 420;

export const BootSplash = ({
  version = '0.0.1',
  tagline = 'FINDING APEX…',
  stages = DEFAULT_STAGES,
  minHoldMs = DEFAULT_MIN_HOLD_MS,
  done = false,
  onDismissed,
}: BootSplashProps) => {
  const { activeIndex, phase, elapsed } = useBootSplash({
    stagesCount: stages.length,
    minHoldMs,
    done,
    onDismissed,
    completingHoldMs: COMPLETING_HOLD_MS,
    dismissTransitionMs: DISMISS_TRANSITION_MS,
  });

  return (
    <div
      data-theme='apexline'
      data-phase={phase}
      data-dismissing={phase === 'dismissing' || undefined}
      className='boot-splash relative h-full w-full overflow-hidden bg-bg-primary font-sans text-text-primary'
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,107,53,0.10) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 80% 80%, rgba(76,139,245,0.08) 0%, transparent 65%)',
      }}
    >
      <p
        role='status'
        aria-live='polite'
        aria-atomic='true'
        aria-label={
          phase === 'dismissing' ? 'Apexline ready' : 'Loading Apexline'
        }
        className='sr-only'
      >
        {phase === 'dismissing' ? 'Apexline ready' : 'Loading Apexline'}
      </p>

      <BootSplashGrid />
      <div className='boot-splash__scanlines pointer-events-none fixed inset-0 z-[1]' />

      <BootSplashTopHud version={version} />

      <main className='relative z-[2] flex h-full w-full flex-col items-center justify-center gap-14 p-12'>
        <BootSplashMark tagline={tagline} />
        <BootSplashStages
          stages={stages}
          activeIndex={activeIndex}
          phase={phase}
        />
        <BootSplashProgress
          phase={phase}
          activeIndex={activeIndex}
          totalStages={stages.length}
        />
      </main>

      <BootSplashBottomHud elapsed={elapsed} />
    </div>
  );
};
