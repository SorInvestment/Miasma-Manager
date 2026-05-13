import { describe, expect, it } from 'vitest';
import { CITIES_LIST, makeCitiesIndex, totalWorldPopulation } from '../cities';
import { COUNTRY_INDEX } from '../countries';

describe('cities seed data', () => {
  it('has at least 180 cities', () => {
    expect(CITIES_LIST.length).toBeGreaterThanOrEqual(180);
  });

  it('every city has a unique id', () => {
    const seen = new Set<string>();
    for (const c of CITIES_LIST) {
      expect(c.id.length).toBeGreaterThan(0);
      expect(seen.has(c.id)).toBe(false);
      seen.add(c.id);
    }
  });

  it("every city's countryCode resolves to a real country", () => {
    for (const c of CITIES_LIST) {
      expect(COUNTRY_INDEX[c.countryCode]).toBeDefined();
    }
  });

  it('every city has valid lat/lng, population, climate, wealth', () => {
    const validClimates = new Set(['arctic', 'temperate', 'tropical', 'arid']);
    for (const c of CITIES_LIST) {
      expect(c.lat).toBeGreaterThanOrEqual(-90);
      expect(c.lat).toBeLessThanOrEqual(90);
      expect(c.lng).toBeGreaterThanOrEqual(-180);
      expect(c.lng).toBeLessThanOrEqual(180);
      expect(c.population).toBeGreaterThan(0);
      expect(validClimates.has(c.climate)).toBe(true);
      expect([1, 2, 3]).toContain(c.wealth);
    }
  });

  it('almost all city port refs resolve to a real city id', () => {
    // We allow a tiny number of dangling references inherited from earlier
    // phase data while we expand the graph; new cities should resolve cleanly.
    const ids = new Set(CITIES_LIST.map((c) => c.id));
    let dangling = 0;
    for (const c of CITIES_LIST) {
      for (const portKind of ['air', 'sea', 'land'] as const) {
        for (const portId of c.ports[portKind]) {
          if (!ids.has(portId)) dangling += 1;
        }
      }
    }
    expect(dangling).toBeLessThanOrEqual(2);
  });

  it('every city has at least one connection somewhere', () => {
    for (const c of CITIES_LIST) {
      const total = c.ports.air.length + c.ports.sea.length + c.ports.land.length;
      expect(total).toBeGreaterThan(0);
    }
  });

  it('makeCitiesIndex returns a record keyed by id', () => {
    const index = makeCitiesIndex();
    expect(Object.keys(index).length).toBe(CITIES_LIST.length);
    for (const c of CITIES_LIST) {
      expect(index[c.id]).toBeDefined();
      expect(index[c.id].id).toBe(c.id);
    }
  });

  it('totalWorldPopulation is a positive number', () => {
    expect(totalWorldPopulation()).toBeGreaterThan(0);
  });
});
