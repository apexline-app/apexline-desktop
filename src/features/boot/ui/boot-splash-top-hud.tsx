import { Text } from '@apexline-app/apr';

export type BootSplashTopHudProps = {
  version: string;
};

export const BootSplashTopHud = ({ version }: BootSplashTopHudProps) => (
  <div className='fixed left-8 right-8 top-8 z-[3] flex items-center justify-between'>
    <Text variant='kicker' className='tracking-[0.2em]'>
      APEXLINE · v{version} · MVP
    </Text>
    <div className='flex items-center gap-3'>
      <span className='boot-splash__live-dot' />
      <Text variant='kicker' className='tracking-[0.2em]'>
        SESSION INIT
      </Text>
    </div>
  </div>
);
