import { describe, expect, it } from 'vitest';
import { tickCountries, getBorderFluxMultiplier } from '../countryDynamics';
import { makeCountriesIndex } from '../country';
import { makeCitiesIndex } from '../../data/cities';
import { aggregateCountries } from '../countryAgg';
import type { GameState } from '../types';

function baseState(): GameState {
  return {
    mode: 'pathogen',
    day: 10,
    speed: 1,
    cities: makeCitiesIndex(),
    countries: makeCountriesIndex(),
    selectedCountryCode: null,
    pathogen: {
      name: 'Test', type: 'virus',
      transmissibility: 0.4, incubation: 4, infectiousPeriod: 7,
      lethality: 0.02, severity: 0.5, drugResistance: 0,
      climateTolerance: { arctic: 1, temperate: 1, tropical: 1, arid: 1 },
      mutations: new Set(), variants: [],
    },
    dnaPoints: 0, budget: 0, cureProgress: 0, cureFundingLevel: 0,
    cure: { stages: {} as never, activeStageId: 'sequencing', overall: 0 },
    events: [], phase: 'playing', selectedCityId: null,
    history: [], initialPopulation: 0, autoPauseTriggers: new Set(),
    compliance: 0.8, globalInterventions: new Set(),
    difficulty: 'normal', scenarioId: 'sandbox-pathogen',
    winCondition: 'standard', winThreshold: 0,
    lockedInterventions: new Set(), containedDays: 0,
    scenarioCureMultiplier: 1, scenarioDeathLimit: 0,
    globalInterventionExpiry: {}, cityInterventionExpiry: {},
  };
}

describe('countryDynamics', () => {
  it('panic level grows in detected countries', () => {
    const state = baseState();
    state.countries!.US = { ...state.countries!.US, detected: true, panicLevel: 0.1, D: 100_000 };
    const result = tickCountries(state);
    expect(result.state.countries!.US.panicLevel).toBeGreaterThan(0.1);
  });

  it('panic decays in undetected countries', () => {
    const state = baseState();
    state.countries!.AU = { ...state.countries!.AU, detected: false, panicLevel: 0.3 };
    const result = tickCountries(state);
    expect(result.state.countries!.AU.panicLevel).toBeLessThan(0.3);
  });

  it('country collapses when infected fraction exceeds healthcare capacity * threshold', () => {
    const state = baseState();
    const us = state.countries!.US;
    state.countries!.US = {
      ...us,
      detected: true,
      I: us.population * us.healthcareCapacity * 5,
      E: 100_000,
      S: us.population - us.population * us.healthcareCapacity * 5 - 100_000,
    };
    const result = tickCountries(state);
    expect(result.state.countries!.US.collapsed).toBe(true);
    expect(result.state.countries!.US.collapsedDay).toBe(10);
    expect(result.events.some((e) => /collapsed|overflow|hospitals|disintegrates/i.test(e.text))).toBe(true);
  });

  it('autocracies auto-close borders on first detection', () => {
    const state = baseState();
    state.countries!.CN = { ...state.countries!.CN, detected: true, panicLevel: 0.1 };
    const result = tickCountries(state);
    expect(result.state.countries!.CN.borderPolicy).toBe('closed');
    expect(result.events.some((e) => e.text.includes('China'))).toBe(true);
  });

  it('democracies wait for panic before closing borders', () => {
    const state = baseState();
    state.countries!.FR = { ...state.countries!.FR, detected: true, panicLevel: 0.1 };
    const result = tickCountries(state);
    expect(result.state.countries!.FR.borderPolicy).not.toBe('closed');
  });

  it('democracies close borders when panic is high', () => {
    const state = baseState();
    state.countries!.FR = { ...state.countries!.FR, detected: true, panicLevel: 0.7 };
    const result = tickCountries(state);
    expect(result.state.countries!.FR.borderPolicy).toBe('closed');
  });

  it('responseLevel ramps faster in autocracies than democracies', () => {
    const state = baseState();
    state.countries!.US = { ...state.countries!.US, detected: true, responseLevel: 0 };
    state.countries!.CN = { ...state.countries!.CN, detected: true, responseLevel: 0 };
    const result = tickCountries(state);
    expect(result.state.countries!.CN.responseLevel).toBeGreaterThan(result.state.countries!.US.responseLevel);
  });

  it('border flux multiplier scales correctly', () => {
    expect(getBorderFluxMultiplier('open')).toBe(1.0);
    expect(getBorderFluxMultiplier('normal')).toBe(1.0);
    expect(getBorderFluxMultiplier('screened')).toBe(0.5);
    expect(getBorderFluxMultiplier('closed')).toBeLessThan(0.1);
  });

  it('aggregation+dynamics integrates end-to-end', () => {
    const state = baseState();
    const cities = state.cities;
    Object.values(cities).find((c) => c.countryCode === 'BR')!.detected = true;
    const agg = aggregateCountries(cities, state.countries!, state.day);
    const next = { ...state, countries: agg };
    const result = tickCountries(next);
    expect(result.state.countries!.BR.detected).toBe(true);
  });
});
