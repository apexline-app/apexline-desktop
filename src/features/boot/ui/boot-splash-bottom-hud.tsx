import { Numeric, Text } from '@apexline-app/apr';

export type BootSplashBottomHudProps = {
  elapsed: string;
};

export const BootSplashBottomHud = ({ elapsed }: BootSplashBottomHudProps) => (
  <div className='fixed bottom-8 left-8 right-8 z-[3] flex items-center justify-between'>
    <Text variant='kicker' className='text-[10px] tracking-[0.18em]'>
      SEASON 1 · W41 · 13 SERIES TRACKED
    </Text>
    <Numeric
      variant='meta'
      className='text-[10px] tracking-[0.18em] text-text-tertiary'
    >
      {elapsed}
    </Numeric>
  </div>
);
