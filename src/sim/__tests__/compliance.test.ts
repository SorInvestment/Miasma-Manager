import { describe, it, expect } from 'vitest';
import {
  adjustCompliance,
  applyComplianceTickDelta,
  clampCompliance,
  lockdownEffectMultiplier,
  COMPLIANCE_INITIAL,
  COMPLIANCE_MIN,
  COMPLIANCE_MAX,
  PUBLIC_INFO_BONUS,
} from '../compliance';
import { effectiveBeta } from '../seir';
import { deployIntervention } from '../government';
import { LOCKDOWN_BETA_MULT } from '../constants';
import type { City, GameState, Pathogen } from '../types';

const pathogen: Pathogen = {
  name: 'X', type: 'virus',
  transmissibility: 0.5,
  incubation: 4, infectiousPeriod: 7,
  lethality: 0.05, severity: 0.5,
  climateTolerance: { arctic: 0.5, temperate: 1, tropical: 1, arid: 0.9 },
  drugResistance: 0,
  mutations: new Set(),
};

function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'c1', name: 'C1', country: 'X', countryCode: 'X',
    lat: 0, lng: 0, population: 1_000_000,
    S: 950_000, E: 0, I: 50_000, R: 0, D: 0,
    climate: 'temperate', wealth: 2,
    ports: { air: [], sea: [], land: [] },
    detected: false, interventions: new Set(),
    healthcareCapacity: 0.008, healthcareLoad: 0,
    ...overrides,
  };
}

function makeState(cities: Record<string, City>, overrides: Partial<GameState> = {}): GameState {
  return {
    mode: 'defender', day: 0, speed: 1, cities, pathogen,
    dnaPoints: 0, budget: 100, cureProgress: 0, cureFundingLevel: 0,
    events: [], phase: 'playing', selectedCityId: null,
    history: [], initialPopulation: 1_000_000, autoPauseTriggers: new Set(),
    compliance: COMPLIANCE_INITIAL, globalInterventions: new Set(),
    ...overrides,
  };
}

describe('compliance', () => {
  it('clamps to min/max', () => {
    expect(clampCompliance(2)).toBe(COMPLIANCE_MAX);
    expect(clampCompliance(-1)).toBe(COMPLIANCE_MIN);
    expect(clampCompliance(0.5)).toBe(0.5);
  });

  it('lockdownEffectMultiplier reduces effect at low compliance', () => {
    const full = lockdownEffectMultiplier(LOCKDOWN_BETA_MULT, 1.0);
    const weak = lockdownEffectMultiplier(LOCKDOWN_BETA_MULT, 0.1);
    expect(full).toBeCloseTo(LOCKDOWN_BETA_MULT, 4);
    expect(weak).toBeGreaterThan(full);
    expect(weak).toBeGreaterThan(0.85);
  });

  it('decays compliance each tick when lockdowns are active', () => {
    const city = makeCity({ interventions: new Set(['lockdown']) });
    let state = makeState({ [city.id]: city });
    const before = state.compliance;
    state = applyComplianceTickDelta(state);
    expect(state.compliance).toBeLessThan(before);
  });

  it('recovers compliance each tick when no lockdowns and few detections', () => {
    let state = makeState({ a: makeCity({ id: 'a' }) }, { compliance: 0.5 });
    const before = state.compliance;
    state = applyComplianceTickDelta(state);
    expect(state.compliance).toBeGreaterThan(before);
  });

  it('floors at COMPLIANCE_MIN', () => {
    let state = makeState({ a: makeCity({ id: 'a' }) }, { compliance: 0.05 });
    for (let i = 0; i < 1000; i++) {
      state = adjustCompliance(state, -0.05);
    }
    expect(state.compliance).toBe(COMPLIANCE_MIN);
  });

  it('deploying lockdown drops compliance', () => {
    const state = makeState({ a: makeCity({ id: 'a' }) });
    const before = state.compliance;
    const next = deployIntervention(state, 'lockdown', 'a', 6);
    expect(next.compliance).toBeLessThan(before);
  });

  it('deploying public-info raises compliance', () => {
    const state = makeState({ a: makeCity({ id: 'a' }) }, { compliance: 0.5 });
    const next = deployIntervention(state, 'public-info', null, 4);
    expect(next.compliance).toBeCloseTo(0.5 + PUBLIC_INFO_BONUS, 4);
  });

  it('effectiveBeta returns higher beta under lockdown when compliance is low', () => {
    const city = makeCity({ interventions: new Set(['lockdown']) });
    const lowCompliance = effectiveBeta(city, pathogen, { publicInfoActive: false, compliance: 0.1 });
    const highCompliance = effectiveBeta(city, pathogen, { publicInfoActive: false, compliance: 1.0 });
    expect(lowCompliance).toBeGreaterThan(highCompliance);
  });
});
