import { describe, it, expect } from 'vitest';
import { updateDetection, progressCure, anyDetected, deployIntervention, fundResearch } from '../government';
import { makeInitialCureState } from '../cure';
import type { City, GameState, Pathogen } from '../types';

const pathogen: Pathogen = {
  name: 'X', type: 'virus',
  transmissibility: 0.5,
  incubation: 4, infectiousPeriod: 7,
  lethality: 0.05, severity: 1.0,
  climateTolerance: { arctic: 0.5, temperate: 1, tropical: 1, arid: 0.9 },
  drugResistance: 0,
  mutations: new Set(), variants: [],
};

function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'c1', name: 'C1', country: 'X', countryCode: 'X',
    lat: 0, lng: 0, population: 1_000_000,
    S: 950_000, E: 0, I: 50_000, R: 0, D: 0,
    climate: 'temperate', wealth: 2,
    ports: { air: [], sea: [], land: [] },
    detected: false, interventions: new Set(),
    healthcareCapacity: 0.008,
    healthcareLoad: 0, strainState: {},
    ...overrides,
  };
}

function makeState(cities: Record<string, City>, overrides: Partial<GameState> = {}): GameState {
  return {
    mode: 'pathogen', day: 0, speed: 1,
    cities, pathogen,
    dnaPoints: 0, budget: 100, cureProgress: 0, cureFundingLevel: 0, cure: makeInitialCureState(),
    events: [], phase: 'playing', selectedCityId: null,
    history: [], initialPopulation: 1_000_000, autoPauseTriggers: new Set(),
    compliance: 0.85,
    globalInterventions: new Set(),
    difficulty: 'normal',
    scenarioId: 'sandbox-pathogen',
    winCondition: 'standard',
    winThreshold: 0,
    lockedInterventions: new Set(),
    containedDays: 0,
    scenarioCureMultiplier: 1,
    scenarioDeathLimit: 0, globalInterventionExpiry: {}, cityInterventionExpiry: {},
    ...overrides,
  };
}

describe('government', () => {
  it('detection triggers when infection ratio exceeds threshold', () => {
    const city = makeCity({ I: 50_000 });
    const state = makeState({ [city.id]: city });
    const { state: next, newDetections } = updateDetection(state);
    expect(newDetections.length).toBe(1);
    expect(next.cities[city.id].detected).toBe(true);
  });

  it('detection does not trigger below threshold', () => {
    const city = makeCity({ I: 1, S: 999_999 });
    const state = makeState({ [city.id]: city });
    const { newDetections } = updateDetection(state);
    expect(newDetections.length).toBe(0);
  });

  it('anyDetected reflects city states', () => {
    expect(anyDetected(makeState({ a: makeCity({ id: 'a' }) }))).toBe(false);
    expect(anyDetected(makeState({ a: makeCity({ id: 'a', detected: true }) }))).toBe(true);
  });

  it('cure progress does not advance without detection', () => {
    const state = makeState({ a: makeCity({ id: 'a', detected: false }) });
    const next = progressCure(state);
    expect(next.cureProgress).toBe(0);
  });

  it('cure progress advances after detection', () => {
    const state = makeState({ a: makeCity({ id: 'a', detected: true }) });
    const next = progressCure(state);
    expect(next.cureProgress).toBeGreaterThan(0);
  });

  it('drug resistance slows cure progress', () => {
    const resistant: Pathogen = { ...pathogen, drugResistance: 2 };
    const a = makeState({ a: makeCity({ id: 'a', detected: true }) });
    const b = makeState({ a: makeCity({ id: 'a', detected: true }) }, { pathogen: resistant });
    const aNext = progressCure(a);
    const bNext = progressCure(b);
    expect(bNext.cureProgress).toBeLessThan(aNext.cureProgress);
  });

  it('deployIntervention deducts budget and applies effect', () => {
    const state = makeState({ a: makeCity({ id: 'a' }) }, { mode: 'defender' });
    const next = deployIntervention(state, 'lockdown', 'a', 6);
    expect(next.budget).toBe(94);
    expect(next.cities.a.interventions.has('lockdown')).toBe(true);
  });

  it('deployIntervention is no-op when budget insufficient', () => {
    const state = makeState({ a: makeCity({ id: 'a' }) }, { mode: 'defender', budget: 1 });
    const next = deployIntervention(state, 'lockdown', 'a', 6);
    expect(next.budget).toBe(1);
    expect(next.cities.a.interventions.has('lockdown')).toBe(false);
  });

  it('fundResearch raises cureFundingLevel', () => {
    const state = makeState({ a: makeCity({ id: 'a' }) }, { mode: 'defender', budget: 50 });
    const next = fundResearch(state, 20);
    expect(next.cureFundingLevel).toBe(20);
    expect(next.budget).toBe(30);
  });
});
