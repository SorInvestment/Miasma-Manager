import { describe, it, expect } from 'vitest';
import { applyMutationEffect, buyMutation, canAfford, prereqsMet, getMutationById, pathogenTypeAllowed } from '../mutation';
import { makeInitialCureState } from '../cure';
import type { GameState, Pathogen, City } from '../types';

const basePathogen: Pathogen = {
  name: 'X', type: 'virus',
  transmissibility: 0.5,
  incubation: 4, infectiousPeriod: 7,
  lethality: 0.05, severity: 0.5,
  climateTolerance: { arctic: 0.5, temperate: 1, tropical: 1, arid: 0.9 },
  drugResistance: 0,
  mutations: new Set(), variants: [],
};

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    mode: 'pathogen',
    day: 0, speed: 1,
    cities: {},
    pathogen: basePathogen,
    dnaPoints: 100,
    budget: 0,
    cureProgress: 0,
    cureFundingLevel: 0,
    cure: makeInitialCureState(),
    events: [],
    phase: 'playing',
    selectedCityId: null,
    history: [],
    initialPopulation: 1_000_000,
    autoPauseTriggers: new Set(),
    compliance: 0.85,
    globalInterventions: new Set(),
    difficulty: 'normal',
    scenarioId: 'sandbox-pathogen',
    winCondition: 'standard',
    winThreshold: 0,
    lockedInterventions: new Set(),
    containedDays: 0,
    scenarioCureMultiplier: 1,
    scenarioDeathLimit: 0,
    ...overrides,
  };
}

describe('mutation', () => {
  it('applying Airborne 1 raises transmissibility by exactly +0.18', () => {
    const m = getMutationById('airborne-1')!;
    const before = basePathogen.transmissibility;
    const after = applyMutationEffect(basePathogen, m);
    expect(after.transmissibility - before).toBeCloseTo(0.18, 6);
  });

  it('records mutation id in the set', () => {
    const m = getMutationById('coughing')!;
    const after = applyMutationEffect(basePathogen, m);
    expect(after.mutations.has('coughing')).toBe(true);
  });

  it('canAfford returns false when DNA insufficient', () => {
    const m = getMutationById('necrosis')!;
    const state = makeState({ dnaPoints: 5 });
    expect(canAfford(state, m)).toBe(false);
  });

  it('prereqs enforced', () => {
    const m = getMutationById('airborne-2')!;
    expect(prereqsMet(basePathogen, m)).toBe(false);
    const withPrereq: Pathogen = { ...basePathogen, mutations: new Set(['airborne-1']) };
    expect(prereqsMet(withPrereq, m)).toBe(true);
  });

  it('buyMutation deducts cost and adds mutation', () => {
    const state = makeState({ dnaPoints: 10 });
    const next = buyMutation(state, 'airborne-1');
    expect(next.dnaPoints).toBe(6);
    expect(next.pathogen.mutations.has('airborne-1')).toBe(true);
    expect(next.events.length).toBe(1);
    expect(next.events[0].kind).toBe('mutation');
  });

  it('buyMutation is a no-op when prereqs missing', () => {
    const state = makeState({ dnaPoints: 100 });
    const next = buyMutation(state, 'airborne-2');
    expect(next.dnaPoints).toBe(100);
    expect(next.pathogen.mutations.has('airborne-2')).toBe(false);
  });

  it('buyMutation is a no-op when already owned', () => {
    const state = makeState({
      dnaPoints: 100,
      pathogen: { ...basePathogen, mutations: new Set(['airborne-1']) },
    });
    const next = buyMutation(state, 'airborne-1');
    expect(next.dnaPoints).toBe(100);
  });

  it('climate tolerance modifies on apply', () => {
    const m = getMutationById('cold-resist-1')!;
    const after = applyMutationEffect(basePathogen, m);
    expect(after.climateTolerance.arctic).toBeGreaterThan(basePathogen.climateTolerance.arctic);
  });

  it('pathogenTypeOnly restricts which strains a mutation applies to', () => {
    const biofilm = getMutationById('biofilm')!;
    const virusPath: Pathogen = { ...basePathogen, type: 'virus' };
    const bacteriaPath: Pathogen = { ...basePathogen, type: 'bacteria' };
    expect(pathogenTypeAllowed(virusPath, biofilm)).toBe(false);
    expect(pathogenTypeAllowed(bacteriaPath, biofilm)).toBe(true);
  });

  it('buyMutation refuses bacteria-only mutations for virus pathogens', () => {
    const state = makeState({ dnaPoints: 100 });
    const next = buyMutation(state, 'biofilm');
    expect(next.pathogen.mutations.has('biofilm')).toBe(false);
    expect(next.dnaPoints).toBe(100);
  });

  it('spawnsStrain mutation creates a variant and seeds it in active cities', () => {
    const city: City = {
      id: 'lon', name: 'London', country: 'X', countryCode: 'X',
      lat: 0, lng: 0, population: 1_000_000,
      S: 800_000, E: 0, I: 100_000, R: 0, D: 0,
      climate: 'temperate', wealth: 3,
      ports: { air: [], sea: [], land: [] },
      detected: true, interventions: new Set(),
      healthcareCapacity: 0.018, healthcareLoad: 0,
      strainState: { origin: { E: 0, I: 100_000, R: 0 } },
    };
    const state = makeState({
      dnaPoints: 100,
      cities: { lon: city },
      pathogen: { ...basePathogen, mutations: new Set(['drug-resist-1']) },
    });
    const next = buyMutation(state, 'immune-escape');
    expect(next.pathogen.variants).toHaveLength(1);
    expect(next.pathogen.variants[0].mutations.has('immune-escape')).toBe(true);
    expect(next.cities.lon.strainState[next.pathogen.variants[0].id].I).toBeGreaterThan(0);
  });

  it('buyMutation with cureStageRollback subtracts from the named stage', () => {
    const state = makeState({
      dnaPoints: 100,
      pathogen: { ...basePathogen, mutations: new Set(['drug-resist-1']) },
    });
    state.cure.stages['vaccine-rd'].progress = 0.8;
    state.cure.stages['vaccine-rd'].unlocked = true;
    state.cure.stages.sequencing.progress = 1;
    const next = buyMutation(state, 'immune-escape');
    expect(next.cure.stages['vaccine-rd'].progress).toBeCloseTo(0.2, 4);
  });
});
