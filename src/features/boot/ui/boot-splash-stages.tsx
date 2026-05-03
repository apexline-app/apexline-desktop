import {
  BootSplashStageRow,
  type BootSplashStageState,
} from './boot-splash-stage-row';

export type BootSplashStage = {
  id: string;
  label: string;
};

export type BootSplashPhase = 'progressing' | 'completing' | 'dismissing';

export type BootSplashStagesProps = {
  stages: ReadonlyArray<BootSplashStage>;
  activeIndex: number;
  phase: BootSplashPhase;
};

export const computeStageState = (
  index: number,
  activeIndex: number,
  phase: BootSplashPhase,
): BootSplashStageState => {
  if (phase === 'completing' || phase === 'dismissing') return 'done';
  if (index < activeIndex) return 'done';
  if (index === activeIndex) return 'active';
  return 'pending';
};

export const BootSplashStages = ({
  stages,
  activeIndex,
  phase,
}: BootSplashStagesProps) => (
  <div className='flex w-[min(440px,80vw)] flex-col gap-3.5'>
    {stages.map((stage, i) => (
      <BootSplashStageRow
        key={stage.id}
        label={stage.label}
        state={computeStageState(i, activeIndex, phase)}
      />
    ))}
  </div>
);
