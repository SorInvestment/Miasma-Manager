import type { Country, CountryState } from './types';
import { COUNTRY_INDEX } from '../data/countries';

export function makeCountryState(country: Country): CountryState {
  return {
    ...country,
    S: country.population,
    E: 0,
    I: 0,
    R: 0,
    D: 0,
    infectedCities: 0,
    detected: false,
    borderPolicy: 'normal',
    collapsed: false,
    panicLevel: 0,
    responseLevel: 0,
    firstDetectedDay: null,
    collapsedDay: null,
    bordersClosedDay: null,
  };
}

export function makeCountriesIndex(): Record<string, CountryState> {
  const out: Record<string, CountryState> = {};
  for (const code of Object.keys(COUNTRY_INDEX)) {
    out[code] = makeCountryState(COUNTRY_INDEX[code]);
  }
  return out;
}

export function lookupCountry(code: string): Country | undefined {
  return COUNTRY_INDEX[code];
}
