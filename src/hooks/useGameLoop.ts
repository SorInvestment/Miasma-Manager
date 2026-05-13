import { useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameStore';
import { TICK_MS_PER_DAY_AT_1X } from '../sim/constants';

export function useGameLoop() {
  const rafRef = useRef<number | null>(null);
  const accRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    function frame(ts: number) {
      const last = lastTsRef.current ?? ts;
      const dt = ts - last;
      lastTsRef.current = ts;
      const { speed, phase, tickOnce } = useGameStore.getState();
      if (phase === 'playing' && speed > 0) {
        accRef.current += dt * speed;
        const msPerDay = TICK_MS_PER_DAY_AT_1X;
        const maxAcc = msPerDay * 4;
        if (accRef.current > maxAcc) accRef.current = maxAcc;
        while (accRef.current >= msPerDay) {
          accRef.current -= msPerDay;
          tickOnce();
          const after = useGameStore.getState();
          if (after.phase !== 'playing' || after.speed === 0) {
            accRef.current = 0;
            break;
          }
        }
      } else {
        accRef.current = 0;
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);
}
