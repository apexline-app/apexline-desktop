export const BootSplashGrid = () => (
  <svg
    className='pointer-events-none fixed inset-0 z-0 h-full w-full opacity-40'
    aria-hidden='true'
  >
    <defs>
      <pattern
        id='boot-splash-grid'
        width={56}
        height={56}
        patternUnits='userSpaceOnUse'
      >
        <path
          d='M 56 0 L 0 0 0 56'
          fill='none'
          stroke='rgba(245,245,247,0.025)'
          strokeWidth={1}
        />
      </pattern>
    </defs>
    <rect width='100%' height='100%' fill='url(#boot-splash-grid)' />
  </svg>
);
