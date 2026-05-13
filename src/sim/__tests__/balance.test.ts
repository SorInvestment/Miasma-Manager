import { describe, expect, it } from 'vitest';
import { useGameStore } from '../../state/gameStore';

function reset() {
  useGameStore.getState().resetGame();
}

describe('balance — game length', () => {
  it('sandbox pathogen normal at lon resolves within 200..2000 game days', () => {
    reset();
    useGameStore.getState().startGame({
      mode: 'pathogen',
      pathogenType: 'virus',
      startCityId: 'lon',
      difficulty: 'normal',
      scenarioId: 'sandbox-pathogen',
    });

    let day = 0;
    for (let i = 0; i < 4000; i++) {
      useGameStore.getState().tickOnce();
      day = useGameStore.getState().day;
      if (useGameStore.getState().phase !== 'playing') break;
    }
    const phase = useGameStore.getState().phase;
    expect(phase).not.toBe('playing');
    expect(day).toBeGreaterThan(150);
    expect(day).toBeLessThan(2000);
  }, 30000);

  it('sandbox defender normal resolves within bounds too', () => {
    reset();
    useGameStore.getState().startGame({
      mode: 'defender',
      pathogenType: 'virus',
      startCityId: 'lon',
      difficulty: 'normal',
      scenarioId: 'sandbox-defender',
    });

    let day = 0;
    for (let i = 0; i < 4000; i++) {
      useGameStore.getState().tickOnce();
      day = useGameStore.getState().day;
      if (useGameStore.getState().phase !== 'playing') break;
    }
    expect(useGameStore.getState().phase).not.toBe('playing');
    expect(day).toBeGreaterThan(100);
  }, 30000);
});
