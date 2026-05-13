import { describe, expect, it } from 'vitest';
import { COUNTRIES, COUNTRY_INDEX, totalCountryPopulation } from '../countries';

describe('countries seed data', () => {
  it('has at least 180 countries', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(180);
  });

  it('every country has a unique ISO-2 code', () => {
    const seen = new Set<string>();
    for (const c of COUNTRIES) {
      expect(c.code).toMatch(/^[A-Z]{2}$/);
      expect(seen.has(c.code)).toBe(false);
      seen.add(c.code);
    }
  });

  it('total population is in the 7.9B - 8.4B realistic range', () => {
    const total = totalCountryPopulation();
    expect(total).toBeGreaterThan(7_900_000_000);
    expect(total).toBeLessThan(8_400_000_000);
  });

  it('every country has a non-empty name, flag, and valid region', () => {
    const validRegions = new Set(['NA', 'SA', 'EU', 'AF', 'AS', 'OC']);
    for (const c of COUNTRIES) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.flagEmoji.length).toBeGreaterThan(0);
      expect(validRegions.has(c.region)).toBe(true);
    }
  });

  it('every country has ruralPopulation <= population', () => {
    for (const c of COUNTRIES) {
      expect(c.ruralPopulation).toBeLessThanOrEqual(c.population);
      expect(c.ruralPopulation).toBeGreaterThanOrEqual(0);
    }
  });

  it('every country has wealth, compliance, drug, healthcare in valid ranges', () => {
    for (const c of COUNTRIES) {
      expect([1, 2, 3]).toContain(c.wealth);
      expect(c.baseCompliance).toBeGreaterThanOrEqual(0);
      expect(c.baseCompliance).toBeLessThanOrEqual(1);
      expect(c.drugResistance).toBeGreaterThanOrEqual(0);
      expect(c.drugResistance).toBeLessThanOrEqual(0.5);
      expect(c.healthcareCapacity).toBeGreaterThanOrEqual(0);
      expect(c.healthcareCapacity).toBeLessThanOrEqual(1);
    }
  });

  it('COUNTRY_INDEX keys match COUNTRIES codes', () => {
    expect(Object.keys(COUNTRY_INDEX).length).toBe(COUNTRIES.length);
    for (const c of COUNTRIES) {
      expect(COUNTRY_INDEX[c.code]).toBe(c);
    }
  });

  it('major countries appear by name', () => {
    const names = new Set(COUNTRIES.map((c) => c.name));
    for (const expected of [
      'United States', 'China', 'India', 'Brazil', 'Nigeria',
      'Russia', 'Japan', 'Germany', 'United Kingdom', 'Indonesia',
    ]) {
      expect(names.has(expected)).toBe(true);
    }
  });
});
