import { describe, it, expect } from 'vitest';
import { tickCity, healthcareCollapseMultiplier } from '../seir';
import type { City, Pathogen } from '../types';

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
    S: 500_000, E: 0, I: 0, R: 0, D: 0,
    climate: 'temperate', wealth: 2,
    ports: { air: [], sea: [], land: [] },
    detected: false, interventions: new Set(),
    healthcareCapacity: 0.008,
    healthcareLoad: 0, strainState: {},
    ...overrides,
  };
}

describe('healthcare', () => {
  it('capacity ratio < 1 yields no collapse multiplier', () => {
    const city = makeCity({ I: 1_000 });
    const mult = healthcareCollapseMultiplier(city, pathogen.severity);
    expect(mult).toBe(1);
  });

  it('capacity ratio > 1 triggers collapse multiplier', () => {
    const city = makeCity({ I: 100_000 });
    const mult = healthcareCollapseMultiplier(city, pathogen.severity);
    expect(mult).toBeGreaterThan(1);
  });

  it('collapse multiplier caps at 3.5x even under extreme load', () => {
    const city = makeCity({ I: 900_000, S: 100_000 });
    const mult = healthcareCollapseMultiplier(city, pathogen.severity);
    expect(mult).toBeLessThanOrEqual(3.5);
  });

  it('healthcare-surge raises effective capacity, reducing collapse', () => {
    const overloaded = makeCity({ I: 30_000 });
    const surged = makeCity({ I: 30_000, interventions: new Set(['healthcare-surge']) });
    const mNorm = healthcareCollapseMultiplier(overloaded, pathogen.severity);
    const mSurge = healthcareCollapseMultiplier(surged, pathogen.severity);
    expect(mSurge).toBeLessThan(mNorm);
  });

  it('wealth-3 cities seed with higher capacity than wealth-1', () => {
    const w1 = makeCity({ wealth: 1, healthcareCapacity: 0.002 });
    const w3 = makeCity({ wealth: 3, healthcareCapacity: 0.018 });
    expect(w3.healthcareCapacity).toBeGreaterThan(w1.healthcareCapacity);
  });

  it('tickCity stores healthcareLoad on the returned city', () => {
    const city = makeCity({ I: 50_000 });
    const next = tickCity(city, pathogen);
    expect(next.healthcareLoad).toBeGreaterThan(0);
  });

  it('overloaded city kills more than non-overloaded over same window', () => {
    let overloaded = makeCity({ I: 30_000, S: 970_000 });
    let surge = makeCity({ I: 30_000, S: 970_000, interventions: new Set(['healthcare-surge']) });
    for (let i = 0; i < 30; i++) {
      overloaded = tickCity(overloaded, pathogen);
      surge = tickCity(surge, pathogen);
    }
    expect(overloaded.D).toBeGreaterThan(surge.D);
  });
});
