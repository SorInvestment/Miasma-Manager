import { describe, it, expect } from 'vitest';
import { tickCity, effectiveBeta } from '../seir';
import type { City, Pathogen } from '../types';

const basePathogen: Pathogen = {
  name: 'TestVirus',
  type: 'virus',
  transmissibility: 0.6,
  incubation: 4,
  infectiousPeriod: 7,
  lethality: 0.05,
  severity: 0.5,
  climateTolerance: { arctic: 0.5, temperate: 1.0, tropical: 1.0, arid: 0.9 },
  drugResistance: 0,
  mutations: new Set(), variants: [],
};

function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'test',
    name: 'Test',
    country: 'Test',
    countryCode: 'TT',
    lat: 0, lng: 0,
    population: 1_000_000,
    S: 999_990, E: 0, I: 10, R: 0, D: 0,
    climate: 'temperate',
    wealth: 2,
    ports: { air: [], sea: [], land: [] },
    detected: false,
    interventions: new Set(),
    healthcareCapacity: 0.008,
    healthcareLoad: 0, strainState: {},
    ...overrides,
  };
}

describe('tickCity', () => {
  it('preserves total population (S+E+I+R+D) approximately', () => {
    let city = makeCity();
    const initial = city.S + city.E + city.I + city.R + city.D;
    for (let i = 0; i < 100; i++) {
      city = tickCity(city, basePathogen);
    }
    const final = city.S + city.E + city.I + city.R + city.D;
    expect(Math.abs(final - initial) / initial).toBeLessThan(1e-6);
  });

  it('disease-free equilibrium is stable (I=E=0 yields no change)', () => {
    const city = makeCity({ S: 1_000_000, E: 0, I: 0, R: 0, D: 0 });
    const next = tickCity(city, basePathogen);
    expect(next.S).toBe(city.S);
    expect(next.E).toBe(city.E);
    expect(next.I).toBe(city.I);
  });

  it('outbreak grows in early phase when R0 > 1', () => {
    let city = makeCity();
    const initialInfected = city.E + city.I;
    for (let i = 0; i < 20; i++) {
      city = tickCity(city, basePathogen);
    }
    expect(city.E + city.I).toBeGreaterThan(initialInfected);
  });

  it('lockdown reduces effective beta', () => {
    const lockdownCity = makeCity({ interventions: new Set(['lockdown']) });
    const normalCity = makeCity();
    const lockedBeta = effectiveBeta(lockdownCity, basePathogen, { publicInfoActive: false });
    const normalBeta = effectiveBeta(normalCity, basePathogen, { publicInfoActive: false });
    expect(lockedBeta).toBeLessThan(normalBeta);
    expect(lockedBeta / normalBeta).toBeCloseTo(0.22, 2);
  });

  it('healthcare surge reduces death rate', () => {
    const surgeCity = makeCity({ I: 100_000, S: 900_000, interventions: new Set(['healthcare-surge']) });
    const normalCity = makeCity({ I: 100_000, S: 900_000 });
    const surgeNext = tickCity(surgeCity, basePathogen);
    const normalNext = tickCity(normalCity, basePathogen);
    expect(surgeNext.D).toBeLessThan(normalNext.D);
  });

  it('respects climate tolerance', () => {
    const tropicalCity = makeCity({ climate: 'tropical', S: 999_990, I: 10 });
    const arcticCity = makeCity({ climate: 'arctic', S: 999_990, I: 10 });
    const tropicalBeta = effectiveBeta(tropicalCity, basePathogen, { publicInfoActive: false });
    const arcticBeta = effectiveBeta(arcticCity, basePathogen, { publicInfoActive: false });
    expect(arcticBeta).toBeLessThan(tropicalBeta);
  });

  it('infected count eventually decays after peak', () => {
    let city = makeCity({ I: 100, S: 999_900 });
    let peak = 0;
    let peakDay = 0;
    for (let i = 0; i < 365; i++) {
      city = tickCity(city, basePathogen);
      if (city.I > peak) {
        peak = city.I;
        peakDay = i;
      }
    }
    expect(peak).toBeGreaterThan(100);
    expect(peakDay).toBeLessThan(365);
    expect(city.I).toBeLessThan(peak);
  });
});
