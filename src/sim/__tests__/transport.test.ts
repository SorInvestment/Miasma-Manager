import { describe, it, expect } from 'vitest';
import { computeTransfers, applyTransfers } from '../transport';
import type { City } from '../types';

function makeCity(id: string, overrides: Partial<City> = {}): City {
  return {
    id, name: id, country: id, countryCode: id.toUpperCase(),
    lat: 0, lng: 0, population: 1_000_000,
    S: 999_000, E: 0, I: 1_000, R: 0, D: 0,
    climate: 'temperate', wealth: 2,
    ports: { air: [], sea: [], land: [] },
    detected: false, interventions: new Set(),
    ...overrides,
  };
}

describe('transport', () => {
  it('air flux exceeds sea and land flux for equal pop', () => {
    const a = makeCity('a', { ports: { air: ['b'], sea: [], land: [] } });
    const b = makeCity('b', { I: 0, ports: { air: ['a'], sea: [], land: [] } });
    const c = makeCity('c', { ports: { air: [], sea: ['d'], land: [] } });
    const d = makeCity('d', { I: 0, ports: { air: [], sea: ['c'], land: [] } });
    const e = makeCity('e', { ports: { air: [], sea: [], land: ['f'] } });
    const f = makeCity('f', { I: 0, ports: { air: [], sea: [], land: ['e'] } });

    const airT = computeTransfers({ a, b }, new Set());
    const seaT = computeTransfers({ c, d }, new Set());
    const landT = computeTransfers({ e, f }, new Set());

    expect(airT[0].count).toBeGreaterThan(landT[0].count);
    expect(landT[0].count).toBeGreaterThan(seaT[0].count);
  });

  it('travel ban dramatically reduces flux', () => {
    const a = makeCity('a', { ports: { air: ['b'], sea: [], land: [] } });
    const b = makeCity('b', { I: 0, ports: { air: ['a'], sea: [], land: [] } });
    const open = computeTransfers({ a, b }, new Set());
    const banned = computeTransfers({ a, b }, new Set(['travel-ban-air']));
    expect(banned[0].count).toBeLessThan(open[0].count * 0.2);
  });

  it('no transfers when no infected', () => {
    const a = makeCity('a', { I: 0, ports: { air: ['b'], sea: [], land: [] } });
    const b = makeCity('b', { I: 0, ports: { air: ['a'], sea: [], land: [] } });
    const transfers = computeTransfers({ a, b }, new Set());
    expect(transfers.length).toBe(0);
  });

  it('applyTransfers moves infected from source to destination exposed', () => {
    const a = makeCity('a', { I: 100, S: 900, population: 1000, ports: { air: ['b'], sea: [], land: [] } });
    const b = makeCity('b', { I: 0, S: 1000, E: 0, population: 1000, ports: { air: ['a'], sea: [], land: [] } });
    const next = applyTransfers({ a, b }, [{ fromId: 'a', toId: 'b', mode: 'air', count: 10 }]);
    expect(next.a.I).toBe(90);
    expect(next.b.E).toBe(10);
  });
});
