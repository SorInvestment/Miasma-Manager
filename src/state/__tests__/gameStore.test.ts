import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';

function reset() {
  useGameStore.getState().resetGame();
}

describe('gameStore', () => {
  beforeEach(reset);

  it('starts at phase=start', () => {
    expect(useGameStore.getState().phase).toBe('start');
  });

  it('startGame transitions to playing phase and seeds the start city', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    const state = useGameStore.getState();
    expect(state.phase).toBe('playing');
    expect(state.cities.lon.I).toBeGreaterThan(0);
    expect(state.day).toBe(0);
  });

  it('setSpeed updates speed', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    useGameStore.getState().setSpeed(5);
    expect(useGameStore.getState().speed).toBe(5);
  });

  it('togglePause toggles between 0 and 1', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    useGameStore.getState().setSpeed(2);
    useGameStore.getState().togglePause();
    expect(useGameStore.getState().speed).toBe(0);
    useGameStore.getState().togglePause();
    expect(useGameStore.getState().speed).toBe(1);
  });

  it('tickOnce advances day by 1', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    useGameStore.getState().tickOnce();
    expect(useGameStore.getState().day).toBe(1);
  });

  it('selectCity updates selectedCityId', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    useGameStore.getState().selectCity('tok');
    expect(useGameStore.getState().selectedCityId).toBe('tok');
  });

  it('buyMutationAction applies a mutation when affordable', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    useGameStore.setState({ dnaPoints: 10 });
    useGameStore.getState().buyMutationAction('airborne-1');
    expect(useGameStore.getState().pathogen.mutations.has('airborne-1')).toBe(true);
    expect(useGameStore.getState().dnaPoints).toBe(6);
  });

  it('deployInterventionAction deducts budget and adds intervention', () => {
    useGameStore.getState().startGame('defender', 'virus', 'lon');
    useGameStore.setState({ budget: 50 });
    useGameStore.getState().deployInterventionAction('lockdown', 'lon');
    expect(useGameStore.getState().cities.lon.interventions.has('lockdown')).toBe(true);
    expect(useGameStore.getState().budget).toBe(44);
  });

  it('fundResearchAction raises cure funding', () => {
    useGameStore.getState().startGame('defender', 'virus', 'lon');
    useGameStore.setState({ budget: 50 });
    useGameStore.getState().fundResearchAction(15);
    expect(useGameStore.getState().cureFundingLevel).toBe(15);
    expect(useGameStore.getState().budget).toBe(35);
  });

  it('full pathogen play sequence: start → tick × N → buy mutation → tick', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    for (let i = 0; i < 30; i++) useGameStore.getState().tickOnce();
    const beforeBuy = useGameStore.getState();
    useGameStore.setState({ dnaPoints: 20 });
    useGameStore.getState().buyMutationAction('airborne-1');
    const after = useGameStore.getState();
    expect(after.pathogen.transmissibility).toBeGreaterThan(beforeBuy.pathogen.transmissibility);
  });

  it('reaches an end phase within bounded ticks for an aggressive pathogen', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    useGameStore.setState((s) => ({
      pathogen: {
        ...s.pathogen,
        transmissibility: 2.0,
        lethality: 0.4,
        climateTolerance: { arctic: 1, temperate: 1, tropical: 1, arid: 1 },
        drugResistance: 5,
      },
    }));
    for (let i = 0; i < 1500; i++) {
      useGameStore.getState().tickOnce();
      if (useGameStore.getState().phase !== 'playing') break;
    }
    expect(useGameStore.getState().phase).not.toBe('playing');
  });

  it('auto-pause triggers on first detection', () => {
    useGameStore.getState().startGame('pathogen', 'virus', 'lon');
    useGameStore.setState((s) => ({
      pathogen: { ...s.pathogen, transmissibility: 2.0, severity: 1.5 },
      speed: 5,
    }));
    for (let i = 0; i < 60; i++) {
      useGameStore.getState().tickOnce();
      if (useGameStore.getState().autoPauseTriggers.has('first-detection')) break;
    }
    expect(useGameStore.getState().autoPauseTriggers.has('first-detection')).toBe(true);
  });
});
