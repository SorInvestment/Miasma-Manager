import type { City, CountryState, GameState } from './types';
import { makeCountryState } from './country';
import { COUNTRY_INDEX } from '../data/countries';

export function aggregateCountries(
  cities: Record<string, City>,
  prevCountries: Record<string, CountryState>,
  day: number,
): Record<string, CountryState> {
  const next: Record<string, CountryState> = {};
  for (const code of Object.keys(COUNTRY_INDEX)) {
    const prev = prevCountries[code] ?? makeCountryState(COUNTRY_INDEX[code]);
    next[code] = {
      ...prev,
      S: prev.ruralPopulation,
      E: 0,
      I: 0,
      R: 0,
      D: 0,
      infectedCities: 0,
      detected: prev.detected,
      firstDetectedDay: prev.firstDetectedDay,
    };
  }
  for (const city of Object.values(cities)) {
    const country = next[city.countryCode];
    if (!country) continue;
    country.S += city.S;
    country.E += city.E;
    country.I += city.I;
    country.R += city.R;
    country.D += city.D;
    if (city.E + city.I > 0) country.infectedCities += 1;
    if (city.detected && !country.detected) {
      country.detected = true;
      country.firstDetectedDay = day;
    }
  }
  return next;
}

export function countryTotalAlive(country: CountryState): number {
  return country.S + country.E + country.I + country.R;
}

export function countryInfectedFraction(country: CountryState): number {
  const denom = country.population || 1;
  return (country.E + country.I) / denom;
}

export function countryDeathFraction(country: CountryState): number {
  const denom = country.population || 1;
  return country.D / denom;
}

export function topCountriesBy(
  state: GameState,
  metric: 'deaths' | 'infected' | 'panic' | 'collapsed',
  limit: number = 10,
): CountryState[] {
  const sorters: Record<typeof metric, (a: CountryState, b: CountryState) => number> = {
    deaths: (a, b) => b.D - a.D,
    infected: (a, b) => b.E + b.I - (a.E + a.I),
    panic: (a, b) => b.panicLevel - a.panicLevel,
    collapsed: (a, b) =>
      (b.collapsed ? 1 : 0) - (a.collapsed ? 1 : 0) ||
      b.D - a.D,
  };
  return Object.values(state.countries ?? {})
    .sort(sorters[metric])
    .slice(0, limit);
}
