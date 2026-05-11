import type { City, Climate, Wealth } from '../sim/types';

interface CitySeed {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  population: number;
  climate: Climate;
  wealth: Wealth;
  air: string[];
  sea: string[];
  land: string[];
}

const seeds: CitySeed[] = [
  // North America
  { id: 'nyc', name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7, lng: -74.0, population: 20_000_000, climate: 'temperate', wealth: 3,
    air: ['lax', 'chi', 'lon', 'par', 'tor', 'mex', 'mia', 'sao', 'dub', 'fra'], sea: ['lon', 'rio'], land: ['chi', 'tor'] },
  { id: 'lax', name: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.0, lng: -118.2, population: 13_000_000, climate: 'arid', wealth: 3,
    air: ['nyc', 'chi', 'tok', 'sea', 'syd', 'mex', 'van', 'sin', 'hkg'], sea: ['tok', 'syd'], land: ['mex', 'sea'] },
  { id: 'chi', name: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.9, lng: -87.6, population: 9_500_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'lax', 'tor', 'mia', 'lon'], sea: [], land: ['nyc', 'tor', 'mex'] },
  { id: 'mia', name: 'Miami', country: 'United States', countryCode: 'US', lat: 25.8, lng: -80.2, population: 6_200_000, climate: 'tropical', wealth: 3,
    air: ['nyc', 'chi', 'bog', 'mex', 'sao', 'lim'], sea: ['rio', 'bog', 'lim'], land: [] },
  { id: 'mex', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.4, lng: -99.1, population: 22_000_000, climate: 'temperate', wealth: 2,
    air: ['nyc', 'lax', 'mia', 'bog', 'lim', 'mad'], sea: [], land: ['lax', 'chi'] },
  { id: 'tor', name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.7, lng: -79.4, population: 6_400_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'chi', 'lon', 'van'], sea: [], land: ['nyc', 'chi', 'van'] },
  { id: 'van', name: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.3, lng: -123.1, population: 2_600_000, climate: 'temperate', wealth: 3,
    air: ['lax', 'tok', 'hkg', 'tor', 'sea'], sea: ['tok', 'sea'], land: ['lax', 'sea', 'tor'] },
  { id: 'sea', name: 'Seattle', country: 'United States', countryCode: 'US', lat: 47.6, lng: -122.3, population: 4_000_000, climate: 'temperate', wealth: 3,
    air: ['lax', 'tok', 'van', 'chi'], sea: ['tok', 'van'], land: ['lax', 'van'] },

  // South America
  { id: 'sao', name: 'São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.5, lng: -46.6, population: 22_500_000, climate: 'tropical', wealth: 2,
    air: ['nyc', 'mia', 'rio', 'bue', 'lim', 'lon', 'mad'], sea: ['rio'], land: ['rio', 'bue'] },
  { id: 'rio', name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', lat: -22.9, lng: -43.2, population: 13_500_000, climate: 'tropical', wealth: 2,
    air: ['sao', 'bue', 'mad', 'lis', 'mia'], sea: ['nyc', 'mia', 'lis'], land: ['sao', 'bue'] },
  { id: 'bue', name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', lat: -34.6, lng: -58.4, population: 15_200_000, climate: 'temperate', wealth: 2,
    air: ['sao', 'rio', 'lim', 'mad'], sea: ['rio'], land: ['sao', 'rio', 'lim'] },
  { id: 'lim', name: 'Lima', country: 'Peru', countryCode: 'PE', lat: -12.0, lng: -77.0, population: 10_700_000, climate: 'arid', wealth: 1,
    air: ['mia', 'mex', 'sao', 'bog'], sea: ['mia'], land: ['bog', 'bue'] },
  { id: 'bog', name: 'Bogotá', country: 'Colombia', countryCode: 'CO', lat: 4.7, lng: -74.1, population: 11_300_000, climate: 'tropical', wealth: 2,
    air: ['mia', 'mex', 'lim'], sea: ['mia'], land: ['lim'] },

  // Europe
  { id: 'lon', name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5, lng: -0.1, population: 14_500_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'chi', 'tor', 'par', 'fra', 'mos', 'dub', 'sin', 'hkg', 'tok', 'syd', 'cai', 'mum', 'sao', 'lag', 'jhb'], sea: ['nyc', 'ams'], land: ['par'] },
  { id: 'par', name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.9, lng: 2.4, population: 11_000_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'lon', 'ber', 'rom', 'mad', 'dub', 'cai', 'mum'], sea: [], land: ['lon', 'ber', 'mad', 'rom', 'ams'] },
  { id: 'mad', name: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4, lng: -3.7, population: 6_700_000, climate: 'temperate', wealth: 3,
    air: ['par', 'lon', 'sao', 'bue', 'rio', 'mex', 'cas'], sea: [], land: ['par', 'lis', 'rom'] },
  { id: 'lis', name: 'Lisbon', country: 'Portugal', countryCode: 'PT', lat: 38.7, lng: -9.1, population: 3_000_000, climate: 'temperate', wealth: 3,
    air: ['mad', 'rio', 'sao', 'lon'], sea: ['rio'], land: ['mad'] },
  { id: 'ber', name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.5, lng: 13.4, population: 6_200_000, climate: 'temperate', wealth: 3,
    air: ['par', 'lon', 'mos', 'ams', 'fra', 'ist'], sea: [], land: ['par', 'ams', 'fra', 'mos'] },
  { id: 'fra', name: 'Frankfurt', country: 'Germany', countryCode: 'DE', lat: 50.1, lng: 8.7, population: 5_800_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'lon', 'par', 'ber', 'dub', 'sin', 'hkg', 'tok', 'mum'], sea: [], land: ['ber', 'par', 'ams'] },
  { id: 'rom', name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9, lng: 12.5, population: 4_400_000, climate: 'temperate', wealth: 3,
    air: ['par', 'lon', 'ist', 'cai'], sea: ['cai'], land: ['par', 'mad', 'ber'] },
  { id: 'ams', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.4, lng: 4.9, population: 2_500_000, climate: 'temperate', wealth: 3,
    air: ['lon', 'par', 'ber', 'fra'], sea: ['lon'], land: ['ber', 'par', 'fra'] },
  { id: 'mos', name: 'Moscow', country: 'Russia', countryCode: 'RU', lat: 55.8, lng: 37.6, population: 12_500_000, climate: 'temperate', wealth: 2,
    air: ['lon', 'ber', 'ist', 'beij', 'dub'], sea: [], land: ['ber', 'ist', 'beij'] },
  { id: 'ist', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.0, lng: 28.9, population: 16_000_000, climate: 'temperate', wealth: 2,
    air: ['rom', 'mos', 'cai', 'dub', 'lon', 'ber'], sea: ['cai'], land: ['mos', 'teh', 'rom'] },
  { id: 'rey', name: 'Reykjavik', country: 'Iceland', countryCode: 'IS', lat: 64.1, lng: -21.9, population: 230_000, climate: 'arctic', wealth: 3,
    air: ['lon', 'nyc', 'tor'], sea: [], land: [] },

  // Africa
  { id: 'cai', name: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.0, lng: 31.2, population: 21_300_000, climate: 'arid', wealth: 1,
    air: ['lon', 'par', 'rom', 'ist', 'dub', 'lag', 'jhb', 'nai'], sea: ['rom'], land: ['cas', 'ist', 'rid'] },
  { id: 'cas', name: 'Casablanca', country: 'Morocco', countryCode: 'MA', lat: 33.6, lng: -7.6, population: 4_400_000, climate: 'arid', wealth: 1,
    air: ['mad', 'par', 'cai'], sea: ['mad'], land: ['cai'] },
  { id: 'lag', name: 'Lagos', country: 'Nigeria', countryCode: 'NG', lat: 6.5, lng: 3.4, population: 15_300_000, climate: 'tropical', wealth: 1,
    air: ['lon', 'cai', 'jhb', 'nai', 'dub'], sea: ['jhb'], land: [] },
  { id: 'nai', name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.3, lng: 36.8, population: 5_100_000, climate: 'tropical', wealth: 1,
    air: ['cai', 'lag', 'jhb', 'dub', 'lon'], sea: [], land: ['jhb'] },
  { id: 'jhb', name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', lat: -26.2, lng: 28.0, population: 6_000_000, climate: 'temperate', wealth: 2,
    air: ['lon', 'cai', 'lag', 'nai', 'dub', 'syd'], sea: ['lag'], land: ['nai'] },

  // Middle East
  { id: 'dub', name: 'Dubai', country: 'UAE', countryCode: 'AE', lat: 25.3, lng: 55.3, population: 3_500_000, climate: 'arid', wealth: 3,
    air: ['lon', 'par', 'fra', 'nyc', 'mum', 'del', 'bom', 'sin', 'hkg', 'tok', 'cai', 'jhb', 'lag', 'syd', 'mos'], sea: ['mum'], land: ['rid', 'teh'] },
  { id: 'rid', name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.7, lng: 46.7, population: 7_700_000, climate: 'arid', wealth: 2,
    air: ['dub', 'cai', 'ist'], sea: [], land: ['dub', 'cai'] },
  { id: 'teh', name: 'Tehran', country: 'Iran', countryCode: 'IR', lat: 35.7, lng: 51.4, population: 9_300_000, climate: 'arid', wealth: 1,
    air: ['ist', 'dub', 'del'], sea: [], land: ['ist', 'dub', 'del'] },

  // Asia
  { id: 'mum', name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.1, lng: 72.9, population: 20_900_000, climate: 'tropical', wealth: 1,
    air: ['dub', 'lon', 'fra', 'par', 'sin', 'del', 'bkk', 'hkg'], sea: ['dub', 'sin'], land: ['del', 'kar', 'dac'] },
  { id: 'del', name: 'Delhi', country: 'India', countryCode: 'IN', lat: 28.6, lng: 77.2, population: 32_000_000, climate: 'arid', wealth: 1,
    air: ['dub', 'lon', 'mum', 'teh', 'sin', 'hkg'], sea: [], land: ['mum', 'kar', 'dac'] },
  { id: 'kar', name: 'Karachi', country: 'Pakistan', countryCode: 'PK', lat: 24.9, lng: 67.0, population: 16_500_000, climate: 'arid', wealth: 1,
    air: ['dub', 'mum', 'del'], sea: ['dub', 'mum'], land: ['del', 'mum'] },
  { id: 'dac', name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', lat: 23.8, lng: 90.4, population: 22_400_000, climate: 'tropical', wealth: 1,
    air: ['del', 'mum', 'bkk', 'sin'], sea: [], land: ['del', 'mum'] },
  { id: 'beij', name: 'Beijing', country: 'China', countryCode: 'CN', lat: 39.9, lng: 116.4, population: 21_500_000, climate: 'temperate', wealth: 2,
    air: ['sha', 'hkg', 'sel', 'tok', 'sin', 'mos', 'fra', 'lon'], sea: [], land: ['sha', 'mos', 'sel'] },
  { id: 'sha', name: 'Shanghai', country: 'China', countryCode: 'CN', lat: 31.2, lng: 121.5, population: 28_500_000, climate: 'temperate', wealth: 2,
    air: ['beij', 'hkg', 'tok', 'sin', 'sel', 'lax', 'sea'], sea: ['tok', 'hkg'], land: ['beij', 'hkg'] },
  { id: 'hkg', name: 'Hong Kong', country: 'China', countryCode: 'CN', lat: 22.3, lng: 114.2, population: 7_500_000, climate: 'tropical', wealth: 3,
    air: ['lon', 'lax', 'van', 'sin', 'tok', 'beij', 'sha', 'sel', 'mum', 'del', 'syd', 'man', 'bkk', 'jak'], sea: ['sha', 'sin'], land: ['sha'] },
  { id: 'tok', name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.7, lng: 139.7, population: 37_400_000, climate: 'temperate', wealth: 3,
    air: ['lax', 'sea', 'sin', 'hkg', 'sha', 'beij', 'sel', 'lon', 'syd', 'man', 'dub', 'van', 'fra'], sea: ['lax', 'sea', 'sha'], land: [] },
  { id: 'sel', name: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.6, lng: 127.0, population: 25_500_000, climate: 'temperate', wealth: 3,
    air: ['tok', 'beij', 'sha', 'hkg', 'sin'], sea: ['tok'], land: ['beij'] },
  { id: 'bkk', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.8, lng: 100.5, population: 10_500_000, climate: 'tropical', wealth: 2,
    air: ['hkg', 'sin', 'mum', 'dac', 'jak', 'man', 'tok'], sea: ['sin'], land: ['sin'] },
  { id: 'sin', name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3, lng: 103.8, population: 5_900_000, climate: 'tropical', wealth: 3,
    air: ['lon', 'fra', 'dub', 'mum', 'del', 'hkg', 'tok', 'sel', 'bkk', 'jak', 'man', 'syd', 'beij', 'sha', 'lax'], sea: ['hkg', 'mum', 'jak', 'bkk'], land: ['bkk'] },
  { id: 'jak', name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', lat: -6.2, lng: 106.8, population: 10_800_000, climate: 'tropical', wealth: 2,
    air: ['sin', 'hkg', 'man', 'bkk', 'syd', 'dub'], sea: ['sin'], land: [] },
  { id: 'man', name: 'Manila', country: 'Philippines', countryCode: 'PH', lat: 14.6, lng: 120.9, population: 14_400_000, climate: 'tropical', wealth: 1,
    air: ['hkg', 'sin', 'tok', 'jak', 'bkk', 'syd'], sea: ['hkg'], land: [] },

  // Oceania
  { id: 'syd', name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.9, lng: 151.2, population: 5_400_000, climate: 'temperate', wealth: 3,
    air: ['lax', 'lon', 'sin', 'hkg', 'tok', 'auc', 'jak', 'man', 'jhb', 'dub'], sea: ['auc'], land: [] },
  { id: 'auc', name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.9, lng: 174.8, population: 1_700_000, climate: 'temperate', wealth: 3,
    air: ['syd', 'lax', 'sin'], sea: ['syd'], land: [] },
];

export const CITIES_LIST: City[] = seeds.map((s) => ({
  id: s.id,
  name: s.name,
  country: s.country,
  countryCode: s.countryCode,
  lat: s.lat,
  lng: s.lng,
  population: s.population,
  S: s.population,
  E: 0,
  I: 0,
  R: 0,
  D: 0,
  climate: s.climate,
  wealth: s.wealth,
  ports: { air: s.air, sea: s.sea, land: s.land },
  detected: false,
  interventions: new Set(),
}));

export function makeCitiesIndex(): Record<string, City> {
  const out: Record<string, City> = {};
  for (const c of CITIES_LIST) {
    out[c.id] = {
      ...c,
      interventions: new Set(c.interventions),
    };
  }
  return out;
}

export function totalWorldPopulation(): number {
  return CITIES_LIST.reduce((acc, c) => acc + c.population, 0);
}
