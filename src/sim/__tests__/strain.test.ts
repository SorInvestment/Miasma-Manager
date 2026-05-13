import { describe, it, expect } from 'vitest';
import {
  ORIGIN_STRAIN_ID,
  allStrains,
  cityTotals,
  crossImmunity,
  ensureStrainCompartment,
  findStrain,
  jaccardSimilarity,
  makeEmptyCompartment,
  makeVariantStrain,
  originAsStrain,
  recomputeCityAggregates,
} from '../strain';
import { tickCity } from '../seir';
import type { City, Pathogen } from '../types';

const pathogen: Pathogen = {
  name: 'P', type: 'virus',
  transmissibility: 0.5, incubation: 4, infectiousPeriod: 7,
  lethality: 0.05, severity: 0.5,
  climateTolerance: { arctic: 0.5, temperate: 1, tropical: 1, arid: 0.9 },
  drugResistance: 0, mutations: new Set(), variants: [],
};

function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'c1', name: 'C1', country: 'X', countryCode: 'X',
    lat: 0, lng: 0, population: 1_000_000,
    S: 990_000, E: 0, I: 10_000, R: 0, D: 0,
    climate: 'temperate', wealth: 2,
    ports: { air: [], sea: [], land: [] },
    detected: false, interventions: new Set(),
    healthcareCapacity: 0.008, healthcareLoad: 0,
    strainState: {},
    ...overrides,
  };
}

describe('strain', () => {
  it('originAsStrain projects pathogen into a Strain object', () => {
    const s = originAsStrain(pathogen);
    expect(s.id).toBe(ORIGIN_STRAIN_ID);
    expect(s.parentId).toBeNull();
    expect(s.transmissibility).toBe(pathogen.transmissibility);
  });

  it('allStrains returns origin plus variants', () => {
    const variant = makeVariantStrain({
      id: 'v1', name: 'Alpha',
      parentStrain: originAsStrain(pathogen),
      newMutationId: 'immune-escape',
      effect: { transmissibility: 0.7 },
      spawnedDay: 30,
    });
    const p: Pathogen = { ...pathogen, variants: [variant] };
    expect(allStrains(p)).toHaveLength(2);
    expect(allStrains(p)[1].id).toBe('v1');
  });

  it('findStrain returns origin or named variant', () => {
    const variant = makeVariantStrain({
      id: 'v1', name: 'Alpha',
      parentStrain: originAsStrain(pathogen),
      newMutationId: 'm1',
      spawnedDay: 0,
    });
    const p: Pathogen = { ...pathogen, variants: [variant] };
    expect(findStrain(p, ORIGIN_STRAIN_ID)?.id).toBe(ORIGIN_STRAIN_ID);
    expect(findStrain(p, 'v1')?.id).toBe('v1');
    expect(findStrain(p, 'missing')).toBeUndefined();
  });

  it('makeEmptyCompartment yields zeros', () => {
    expect(makeEmptyCompartment()).toEqual({ E: 0, I: 0, R: 0 });
  });

  it('ensureStrainCompartment creates missing entries', () => {
    const city = makeCity();
    const next = ensureStrainCompartment(city, 'v1');
    expect(next.strainState.v1).toEqual({ E: 0, I: 0, R: 0 });
  });

  it('cityTotals sums per-strain compartments', () => {
    const city = makeCity({
      strainState: {
        origin: { E: 100, I: 200, R: 50 },
        v1: { E: 30, I: 70, R: 10 },
      },
    });
    expect(cityTotals(city)).toEqual({ E: 130, I: 270, R: 60 });
  });

  it('recomputeCityAggregates updates city.E/I/R from strainState', () => {
    const city = makeCity({
      strainState: { origin: { E: 1, I: 2, R: 3 } },
      E: 0, I: 0, R: 0,
    });
    const next = recomputeCityAggregates(city);
    expect(next.E).toBe(1);
    expect(next.I).toBe(2);
    expect(next.R).toBe(3);
  });

  it('crossImmunity is 1 for the same strain', () => {
    const s = originAsStrain(pathogen);
    expect(crossImmunity(s, s)).toBe(1);
  });

  it('jaccardSimilarity is 0 for disjoint and 1 for identical', () => {
    expect(jaccardSimilarity(new Set(['a']), new Set(['b']))).toBe(0);
    expect(jaccardSimilarity(new Set(['a', 'b']), new Set(['a', 'b']))).toBe(1);
    expect(jaccardSimilarity(new Set(), new Set())).toBe(1);
  });

  it('tickCity competes two strains for the same S pool', () => {
    const variant = makeVariantStrain({
      id: 'v1', name: 'Alpha',
      parentStrain: originAsStrain(pathogen),
      newMutationId: 'immune-escape',
      effect: { transmissibility: 0.5 },
      spawnedDay: 0,
    });
    const p: Pathogen = { ...pathogen, variants: [variant] };
    const city = makeCity({
      S: 500,
      I: 0,
      strainState: {
        origin: { E: 0, I: 250, R: 0 },
        v1: { E: 0, I: 250, R: 0 },
      },
    });
    const next = tickCity(city, p, { publicInfoActive: false, compliance: 1.0 });
    expect(next.S).toBeLessThan(500);
    const totalNewE = (next.strainState.origin.E) + (next.strainState.v1.E);
    expect(totalNewE).toBeGreaterThan(0);
  });

  it('tickCity preserves population conservation across strains', () => {
    const variant = makeVariantStrain({
      id: 'v1', name: 'Alpha',
      parentStrain: originAsStrain(pathogen),
      newMutationId: 'immune-escape',
      spawnedDay: 0,
    });
    const p: Pathogen = { ...pathogen, variants: [variant] };
    let city = makeCity({
      strainState: {
        origin: { E: 0, I: 5_000, R: 0 },
        v1: { E: 0, I: 5_000, R: 0 },
      },
      I: 10_000,
    });
    const initialN = city.S + city.E + city.I + city.R + city.D;
    for (let i = 0; i < 30; i++) {
      city = tickCity(city, p, { publicInfoActive: false, compliance: 1.0 });
    }
    const finalN = city.S + city.E + city.I + city.R + city.D;
    expect(Math.abs(finalN - initialN) / initialN).toBeLessThan(1e-3);
  });
});
