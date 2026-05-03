import { LogoLockup, Text } from '@apexline-app/apr';

const MARK_SIZE = 160;
const MARK_PATH = 'M3 26 Q 8 22, 12 16 Q 16 8, 20 8 Q 24 8, 29 14';

export type BootSplashMarkProps = {
  tagline: string;
};

export const BootSplashMark = ({ tagline }: BootSplashMarkProps) => (
  <div className='relative flex flex-col items-center gap-3.5'>
    <svg
      width={MARK_SIZE}
      height={MARK_SIZE}
      viewBox='0 0 32 32'
      fill='none'
      role='img'
      aria-label='apexline'
      className='block'
    >
      <path
        d={MARK_PATH}
        stroke='rgba(245,245,247,0.18)'
        strokeWidth={2}
        strokeLinecap='round'
        fill='none'
      />
      <path
        d={MARK_PATH}
        stroke='var(--color-brand-accent)'
        strokeWidth={2}
        strokeLinecap='round'
        fill='none'
        className='boot-splash__trail'
      />
      <circle
        cx={20}
        cy={8}
        r={3}
        fill='var(--color-brand-accent)'
        className='boot-splash__dot'
      />
    </svg>

    <LogoLockup size={36} layout='horizontal' showMark={false} />

    <Text variant='kicker' className='boot-splash__tagline tracking-[0.3em]'>
      {tagline}
    </Text>
  </div>
);
