import { describe, it, expect } from 'vitest';
import {
  applyExpiry,
  applyVaccineRollout,
  applyWhoEmergencyFunding,
  isAntiviralActive,
  setInterventionExpiry,
  ANTIVIRAL_DURATION_DAYS,
  SCHOOL_CLOSURE_DURATION_DAYS,
  WHO_BUDGET_BONUS,
} from '../interventions';
import { makeInitialCureState } from '../cure';
import { deployIntervention } from '../government';
import { tickCity } from '../seir';
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
    id: 'c1', name: 'C1', country: 'X', countryCode: 'X',
    lat: 0, lng: 0, population: 1_000_000,
    S: 950_000, E: 0, I: 50_000, R: 0, D: 0,
    climate: 'temperate', wealth: 3,
    ports: { air: [], sea: [], land: [] },
    detected: true, interventions: new Set(),
    healthcareCapacity: 0.018, healthcareLoad: 0,
    strainState: { origin: { E: 0, I: 50_000, R: 0 } },
    ...overrides,
  };
}

function makeState(cities: Record<string, City> = { a: makeCity() }, overrides: Partial<GameState> = {}): GameState {
  return {
    mode: 'defender', day: 0, speed: 1,
    cities, pathogen,
    dnaPoints: 0, budget: 200, cureProgress: 0, cureFundingLevel: 0,
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

describe('interventions', () => {
  it('mask-mandate reduces effective beta', () => {
    const city = makeCity({ interventions: new Set(['mask-mandate']) });
    const t = tickCity(city, pathogen, { publicInfoActive: false, compliance: 1.0 });
    const baseline = tickCity(makeCity(), pathogen, { publicInfoActive: false, compliance: 1.0 });
    expect(t.E).toBeLessThan(baseline.E);
  });

  it('quarantine-facility moves a fraction of I to R each tick', () => {
    const city = makeCity({ I: 100_000, strainState: { origin: { E: 0, I: 100_000, R: 0 } }, interventions: new Set(['quarantine-facility']) });
    const next = tickCity(city, { ...pathogen, transmissibility: 0 }, { publicInfoActive: false, compliance: 1.0 });
    expect(next.R).toBeGreaterThan(0);
  });

  it('school-closure auto-expires after 60 days', () => {
    const initial = makeState({ a: makeCity({ id: 'a' }) });
    let state = deployIntervention(initial, 'school-closure', 'a', 4);
    expect(state.cities.a.interventions.has('school-closure')).toBe(true);
    state = { ...state, day: SCHOOL_CLOSURE_DURATION_DAYS + 1 };
    state = applyExpiry(state);
    expect(state.cities.a.interventions.has('school-closure')).toBe(false);
  });

  it('antiviral-stockpile expires after 90 days', () => {
    let state = deployIntervention(makeState(), 'antiviral-stockpile', null, 11);
    expect(state.globalInterventions.has('antiviral-stockpile')).toBe(true);
    state = { ...state, day: ANTIVIRAL_DURATION_DAYS + 1 };
    state = applyExpiry(state);
    expect(state.globalInterventions.has('antiviral-stockpile')).toBe(false);
  });

  it('vaccine-rollout-1 requires distribution stage >= 0.3', () => {
    const blocked = makeState();
    const after = deployIntervention(blocked, 'vaccine-rollout-1', null, 14);
    expect(after.globalInterventions.has('vaccine-rollout-1')).toBe(false);
  });

  it('vaccine-rollout-1 succeeds once distribution stage passes the gate', () => {
    const ready = makeState();
    ready.cure.stages.distribution.progress = 0.4;
    const after = deployIntervention(ready, 'vaccine-rollout-1', null, 14);
    expect(after.globalInterventions.has('vaccine-rollout-1')).toBe(true);
  });

  it('applyVaccineRollout converts S to R when active and stage gate met', () => {
    const state = makeState();
    state.cure.stages.distribution.progress = 0.5;
    state.globalInterventions.add('vaccine-rollout-1');
    const next = applyVaccineRollout(state);
    expect(next.cities.a.S).toBeLessThan(state.cities.a.S);
    expect(next.cities.a.R).toBeGreaterThan(state.cities.a.R);
  });

  it('who-emergency-funding adds budget and stage funding', () => {
    const base = makeState();
    const next = applyWhoEmergencyFunding(base);
    expect(next.budget).toBe(base.budget + WHO_BUDGET_BONUS);
    expect(next.cure.stages.sequencing.funding).toBeGreaterThan(0);
  });

  it('isAntiviralActive reflects globalInterventions membership', () => {
    const a = makeState();
    expect(isAntiviralActive(a)).toBe(false);
    a.globalInterventions.add('antiviral-stockpile');
    expect(isAntiviralActive(a)).toBe(true);
  });

  it('contact-tracing requires wealth >= 2', () => {
    const poor = makeState({ a: makeCity({ wealth: 1 }) });
    const after = deployIntervention(poor, 'contact-tracing', 'a', 7);
    expect(after.cities.a.interventions.has('contact-tracing')).toBe(false);
  });

  it('targeted-district-lockdown only applies its effect in hot cities', () => {
    const cool = makeCity({ I: 100, strainState: { origin: { E: 0, I: 100, R: 0 } } });
    const hot = makeCity({ I: 50_000, strainState: { origin: { E: 0, I: 50_000, R: 0 } } });
    const coolWith = { ...cool, interventions: new Set(['targeted-district-lockdown' as const]) };
    const hotWith = { ...hot, interventions: new Set(['targeted-district-lockdown' as const]) };
    const tCool = tickCity(coolWith, pathogen, { publicInfoActive: false, compliance: 1.0 });
    const tHot = tickCity(hotWith, pathogen, { publicInfoActive: false, compliance: 1.0 });
    const tCoolNo = tickCity(cool, pathogen, { publicInfoActive: false, compliance: 1.0 });
    const tHotNo = tickCity(hot, pathogen, { publicInfoActive: false, compliance: 1.0 });
    expect(tCool.E).toBeCloseTo(tCoolNo.E, 4);
    expect(tHot.E).toBeLessThan(tHotNo.E);
  });

  it('setInterventionExpiry records expiry for known timed interventions only', () => {
    const a = makeState();
    const withExpiry = setInterventionExpiry(a, 'global', 'antiviral-stockpile', null);
    expect(withExpiry.globalInterventionExpiry['antiviral-stockpile']).toBe(a.day + ANTIVIRAL_DURATION_DAYS);
    const noChange = setInterventionExpiry(a, 'global', 'public-info', null);
    expect(noChange).toBe(a);
  });
});
