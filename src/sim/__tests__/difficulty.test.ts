import { describe, it, expect } from 'vitest';
import { DIFFICULTY, getMultipliers, DIFFICULTY_LIST } from '../difficulty';
import { progressCure, deployIntervention } from '../government';
import { makeInitialCureState } from '../cure';
import type { City, GameState, Pathogen } from '../types';

const pathogen: Pathogen = {
  name: 'X', type: 'virus',
  transmissibility: 0.5,
  incubation: 4, infectiousPeriod: 7,
  lethality: 0.05, severity: 0.5,
  climateTolerance: { arctic: 0.5, temperate: 1, tropical: 1, arid: 0.9 },
  drugResistance: 0,
  mutations: new Set(), variants: [],
};

function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'c1', name: 'C1', country: 'X', countryCode: 'X',
    lat: 0, lng: 0, population: 1_000_000,
    S: 999_990, E: 0, I: 10, R: 0, D: 0,
    climate: 'temperate', wealth: 2,
    ports: { air: [], sea: [], land: [] },
    detected: true, interventions: new Set(),
    healthcareCapacity: 0.008, healthcareLoad: 0, strainState: {},
    ...overrides,
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    mode: 'defender', day: 0, speed: 1,
    cities: { a: makeCity() },
    pathogen,
    dnaPoints: 0, budget: 100, cureProgress: 0, cureFundingLevel: 0, cure: makeInitialCureState(),
    events: [], phase: 'playing', selectedCityId: null,
    history: [], initialPopulation: 1_000_000, autoPauseTriggers: new Set(),
    compliance: 0.85, globalInterventions: new Set(),
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

describe('difficulty', () => {
  it('all 4 levels are defined', () => {
    expect(DIFFICULTY_LIST).toHaveLength(4);
    for (const d of DIFFICULTY_LIST) {
      expect(DIFFICULTY[d]).toBeDefined();
      expect(DIFFICULTY[d].cureRate).toBeGreaterThan(0);
    }
  });

  it('brutal has fastest cure, casual has slowest', () => {
    expect(DIFFICULTY.brutal.cureRate).toBeGreaterThan(DIFFICULTY.normal.cureRate);
    expect(DIFFICULTY.casual.cureRate).toBeLessThan(DIFFICULTY.normal.cureRate);
  });

  it('progressCure applies cureRate multiplier', () => {
    const stNormal = progressCure(makeState({ difficulty: 'normal' }));
    const stBrutal = progressCure(makeState({ difficulty: 'brutal' }));
    expect(stBrutal.cureProgress).toBeGreaterThan(stNormal.cureProgress);
  });

  it('intervention cost scales with difficulty', () => {
    const normal = deployIntervention(makeState({ difficulty: 'normal' }), 'lockdown', 'a', 10);
    const brutal = deployIntervention(makeState({ difficulty: 'brutal' }), 'lockdown', 'a', 10);
    const spentNormal = 100 - normal.budget;
    const spentBrutal = 100 - brutal.budget;
    expect(spentBrutal).toBeGreaterThan(spentNormal);
  });

  it('getMultipliers returns correct entry', () => {
    expect(getMultipliers('casual')).toBe(DIFFICULTY.casual);
    expect(getMultipliers('hard')).toBe(DIFFICULTY.hard);
  });
});
