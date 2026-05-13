import { describe, it, expect } from 'vitest';
import { EVENT_TRIGGERS, tryFireRandomEvent } from '../events';
import { makeInitialCureState } from '../cure';
import type { City, GameState, Pathogen } from '../types';

const pathogen: Pathogen = {
  name: 'X', type: 'virus',
  transmissibility: 0.5, incubation: 4, infectiousPeriod: 7,
  lethality: 0.05, severity: 0.5,
  climateTolerance: { arctic: 0.5, temperate: 1, tropical: 1, arid: 0.9 },
  drugResistance: 0, mutations: new Set(), variants: [],
};

function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'lon', name: 'London', country: 'UK', countryCode: 'GB',
    lat: 0, lng: 0, population: 1_000_000,
    S: 800_000, E: 0, I: 10_000, R: 0, D: 0,
    climate: 'temperate', wealth: 3,
    ports: { air: [], sea: ['nyc'], land: [] },
    detected: true, interventions: new Set(['healthcare-surge']),
    healthcareCapacity: 0.018, healthcareLoad: 0,
    strainState: { origin: { E: 0, I: 10_000, R: 0 } },
    ...overrides,
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    mode: 'defender', day: 80, speed: 1,
    cities: { lon: makeCity() },
    pathogen: { ...pathogen, mutations: new Set(['m1', 'm2', 'm3']) },
    dnaPoints: 0, budget: 100, cureProgress: 0, cureFundingLevel: 0,
    cure: makeInitialCureState(),
    events: [], phase: 'playing', selectedCityId: null,
    history: [], initialPopulation: 1_000_000, autoPauseTriggers: new Set(),
    compliance: 0.85, globalInterventions: new Set(),
    difficulty: 'normal',
    scenarioId: 'sandbox-defender',
    winCondition: 'standard', winThreshold: 0,
    lockedInterventions: new Set(), containedDays: 0,
    scenarioCureMultiplier: 1, scenarioDeathLimit: 0,
    globalInterventionExpiry: {}, cityInterventionExpiry: {},
    ...overrides,
  };
}

describe('events', () => {
  it('has exactly 12 triggers', () => {
    expect(EVENT_TRIGGERS).toHaveLength(12);
  });

  it('all triggers have valid weights between 0 and 1', () => {
    for (const e of EVENT_TRIGGERS) {
      expect(e.weightPerTick).toBeGreaterThan(0);
      expect(e.weightPerTick).toBeLessThan(0.05);
    }
  });

  it('antivax-movement requires day > 60 and >5 detected cities', () => {
    const antivax = EVENT_TRIGGERS.find((e) => e.id === 'antivax-movement')!;
    const early = makeState({ day: 30 });
    expect(antivax.guard(early)).toBe(false);
    const detectedCities: Record<string, City> = {};
    for (let i = 0; i < 6; i++) {
      detectedCities['c' + i] = makeCity({ id: 'c' + i, detected: true });
    }
    const late = makeState({ day: 100, cities: detectedCities });
    expect(antivax.guard(late)).toBe(true);
  });

  it('antivax-movement apply drops compliance and logs event', () => {
    const antivax = EVENT_TRIGGERS.find((e) => e.id === 'antivax-movement')!;
    const before = makeState({ compliance: 0.85 });
    const after = antivax.apply(before);
    expect(after.compliance).toBeLessThan(before.compliance);
    expect(after.events[after.events.length - 1].kind).toBe('world-event');
  });

  it('whistleblower only fires in defender mode', () => {
    const whistle = EVENT_TRIGGERS.find((e) => e.id === 'whistleblower')!;
    expect(whistle.guard(makeState({ mode: 'defender', day: 30 }))).toBe(true);
    expect(whistle.guard(makeState({ mode: 'pathogen', day: 30 }))).toBe(false);
  });

  it('tryFireRandomEvent is a no-op when no infections exist anywhere', () => {
    const empty = makeState({ cities: { lon: makeCity({ I: 0, E: 0, strainState: { origin: { E: 0, I: 0, R: 0 } } }) } });
    const after = tryFireRandomEvent(empty);
    expect(after).toBe(empty);
  });

  it('successful-trial advances trials when guards pass', () => {
    const trial = EVENT_TRIGGERS.find((e) => e.id === 'successful-trial')!;
    const state = makeState();
    state.cure.stages['vaccine-rd'].progress = 0.6;
    state.cure.stages.trials.unlocked = true;
    expect(trial.guard(state)).toBe(true);
    const after = trial.apply(state);
    expect(after.cure.stages.trials.progress).toBeGreaterThan(state.cure.stages.trials.progress);
  });

  it('hospital-strike removes healthcare-surge from a wealthy city', () => {
    const trigger = EVENT_TRIGGERS.find((e) => e.id === 'hospital-strike')!;
    const state = makeState();
    expect(trigger.guard(state)).toBe(true);
    const after = trigger.apply(state);
    const someCityHasSurge = Object.values(after.cities).some((c) => c.interventions.has('healthcare-surge'));
    expect(someCityHasSurge).toBe(false);
  });
});
