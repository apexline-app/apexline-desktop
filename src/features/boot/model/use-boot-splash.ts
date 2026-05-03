import { useEffect, useRef, useState } from 'react';

import type { BootSplashPhase } from '@/features/boot/ui/boot-splash-stages';

export type UseBootSplashOptions = {
  stagesCount: number;
  minHoldMs: number;
  done: boolean;
  onDismissed?: () => void;
  completingHoldMs: number;
  dismissTransitionMs: number;
};

export type UseBootSplashResult = {
  activeIndex: number;
  phase: BootSplashPhase;
  elapsed: string;
};

export const useBootSplash = ({
  stagesCount,
  minHoldMs,
  done,
  onDismissed,
  completingHoldMs,
  dismissTransitionMs,
}: UseBootSplashOptions): UseBootSplashResult => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<BootSplashPhase>('progressing');
  const [holdElapsed, setHoldElapsed] = useState(false);
  const [elapsed, setElapsed] = useState('T+00.0s');
  const startRef = useRef<number | null>(null);
  const completingTriggeredRef = useRef(false);
  const dismissingTriggeredRef = useRef(false);

  useEffect(() => {
    if (phase !== 'progressing' || stagesCount <= 1) return;
    const step = minHoldMs / stagesCount;
    const timers: number[] = [];
    for (let i = 1; i < stagesCount; i++) {
      timers.push(
        window.setTimeout(() => setActiveIndex(i), Math.round(step * i)),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [phase, stagesCount, minHoldMs]);

  useEffect(() => {
    const t = window.setTimeout(() => setHoldElapsed(true), minHoldMs);
    return () => clearTimeout(t);
  }, [minHoldMs]);

  useEffect(() => {
    if (!holdElapsed || !done || completingTriggeredRef.current) return;
    completingTriggeredRef.current = true;
    setPhase('completing');
    setActiveIndex(stagesCount);
    window.setTimeout(() => setPhase('dismissing'), completingHoldMs);
  }, [holdElapsed, done, stagesCount, completingHoldMs]);

  useEffect(() => {
    if (phase !== 'dismissing' || dismissingTriggeredRef.current) return;
    dismissingTriggeredRef.current = true;
    window.setTimeout(() => onDismissed?.(), dismissTransitionMs);
  }, [phase, onDismissed, dismissTransitionMs]);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const dt = (now - startRef.current) / 1000;
      setElapsed(`T+${dt.toFixed(1).padStart(4, '0')}s`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { activeIndex, phase, elapsed };
};
