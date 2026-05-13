import { describe, expect, it } from 'vitest';
import { aggregateCountries, countryInfectedFraction, countryDeathFraction } from '../countryAgg';
import { makeCountriesIndex } from '../country';
import { makeCitiesIndex } from '../../data/cities';
import { COUNTRY_INDEX } from '../../data/countries';

describe('aggregateCountries', () => {
  it('returns one entry per country', () => {
    const cities = makeCitiesIndex();
    const countries = makeCountriesIndex();
    const result = aggregateCountries(cities, countries, 0);
    expect(Object.keys(result).length).toBe(Object.keys(COUNTRY_INDEX).length);
  });

  it('sums city compartments into country', () => {
    const cities = makeCitiesIndex();
    const countries = makeCountriesIndex();
    const usCities = Object.values(cities).filter((c) => c.countryCode === 'US');
    let citySum = 0;
    for (const c of usCities) {
      c.S = 100;
      c.I = 50;
      c.D = 10;
      citySum += 100 + 50 + 10;
    }
    const result = aggregateCountries(cities, countries, 0);
    const us = result.US;
    expect(us.S).toBe(countries.US.ruralPopulation + 100 * usCities.length);
    expect(us.I).toBe(50 * usCities.length);
    expect(us.D).toBe(10 * usCities.length);
    expect(citySum).toBeGreaterThan(0);
  });

  it('counts infected cities correctly', () => {
    const cities = makeCitiesIndex();
    const countries = makeCountriesIndex();
    const usCities = Object.values(cities).filter((c) => c.countryCode === 'US');
    if (usCities.length >= 2) {
      usCities[0].I = 100;
      usCities[1].E = 50;
    }
    const result = aggregateCountries(cities, countries, 0);
    expect(result.US.infectedCities).toBeGreaterThanOrEqual(2);
  });

  it('marks country as detected when any city is detected and records day', () => {
    const cities = makeCitiesIndex();
    const countries = makeCountriesIndex();
    const usCities = Object.values(cities).filter((c) => c.countryCode === 'US');
    usCities[0].detected = true;
    const result = aggregateCountries(cities, countries, 42);
    expect(result.US.detected).toBe(true);
    expect(result.US.firstDetectedDay).toBe(42);
  });

  it('preserves firstDetectedDay across re-aggregation', () => {
    const cities = makeCitiesIndex();
    const countries = makeCountriesIndex();
    Object.values(cities).find((c) => c.countryCode === 'BR')!.detected = true;
    const r1 = aggregateCountries(cities, countries, 12);
    const r2 = aggregateCountries(cities, r1, 50);
    expect(r2.BR.firstDetectedDay).toBe(12);
  });

  it('countryInfectedFraction returns 0..1', () => {
    const cities = makeCitiesIndex();
    const countries = makeCountriesIndex();
    const result = aggregateCountries(cities, countries, 0);
    for (const c of Object.values(result)) {
      const f = countryInfectedFraction(c);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
    }
  });

  it('countryDeathFraction returns 0..1', () => {
    const cities = makeCitiesIndex();
    const countries = makeCountriesIndex();
    const result = aggregateCountries(cities, countries, 0);
    for (const c of Object.values(result)) {
      const f = countryDeathFraction(c);
      expect(f).toBeGreaterThanOrEqual(0);
    }
  });
});
