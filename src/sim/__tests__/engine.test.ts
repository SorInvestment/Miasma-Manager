import { describe, it, expect } from 'vitest';
import { tick } from '../engine';
import { makeCitiesIndex, totalWorldPopulation } from '../../data/cities';
import type { GameState, Pathogen } from '../types';

function makeState(overrides: Partial<GameState> = {}): GameState {
  const cities = makeCitiesIndex();
  const total = totalWorldPopulation();
  cities.lon.S -= 100;
  cities.lon.I = 100;
  const pathogen: Pathogen = {
    name: 'TestVirus', type: 'virus',
    transmissibility: 0.55,
    incubation: 4, infectiousPeriod: 7,
    lethality: 0.04, severity: 0.5,
    climateTolerance: { arctic: 0.4, temperate: 1, tropical: 1, arid: 0.85 },
    drugResistance: 0,
    mutations: new Set(),
  };
  return {
    mode: 'pathogen', day: 0, speed: 1,
    cities, pathogen,
    dnaPoints: 5, budget: 0, cureProgress: 0, cureFundingLevel: 0,
    events: [], phase: 'playing', selectedCityId: null,
    history: [], initialPopulation: total, autoPauseTriggers: new Set(),
    compliance: 0.85,
    globalInterventions: new Set(),
    difficulty: 'normal',
    ...overrides,
  };
}

function sumCompartments(state: GameState): number {
  let total = 0;
  for (const c of Object.values(state.cities)) {
    total += c.S + c.E + c.I + c.R + c.D;
  }
  return total;
}

describe('engine.tick', () => {
  it('preserves global population within tolerance over many ticks', () => {
    let state = makeState();
    const initial = sumCompartments(state);
    for (let i = 0; i < 60; i++) state = tick(state);
    const final = sumCompartments(state);
    expect(Math.abs(final - initial) / initial).toBeLessThan(0.005);
  });

  it('day counter advances exactly +1 per tick', () => {
    let state = makeState();
    for (let i = 0; i < 30; i++) state = tick(state);
    expect(state.day).toBe(30);
  });

  it('history grows by one per tick', () => {
    let state = makeState();
    for (let i = 0; i < 10; i++) state = tick(state);
    expect(state.history.length).toBe(10);
  });

  it('DNA points accumulate in pathogen mode', () => {
    let state = makeState({ dnaPoints: 0 });
    for (let i = 0; i < 80; i++) state = tick(state);
    expect(state.dnaPoints).toBeGreaterThan(0);
  });

  it('budget accumulates in defender mode', () => {
    let state = makeState({ mode: 'defender', budget: 0 });
    for (let i = 0; i < 10; i++) state = tick(state);
    expect(state.budget).toBeGreaterThan(0);
  });

  it('eventually transitions out of "playing" phase given enough ticks', () => {
    let state = makeState({
      pathogen: {
        ...makeState().pathogen,
        transmissibility: 2.5,
        lethality: 0.7,
        severity: 0.1,
        climateTolerance: { arctic: 1, temperate: 1, tropical: 1, arid: 1 },
        drugResistance: 20,
      },
    });
    for (let i = 0; i < 3000; i++) {
      state = tick(state);
      if (state.phase !== 'playing') break;
    }
    expect(state.phase).not.toBe('playing');
  });

  it('does not tick when phase is not playing', () => {
    let state = makeState({ phase: 'won' });
    const before = state.day;
    state = tick(state);
    expect(state.day).toBe(before);
  });

  it('cure progresses after first detection', () => {
    let state = makeState();
    for (let i = 0; i < 80; i++) state = tick(state);
    expect(state.cureProgress).toBeGreaterThan(0);
  });
});
