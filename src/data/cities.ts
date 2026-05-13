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

  // ===== Phase 3 expansion: additional cities =====

  // United States (additional)
  { id: 'hou', name: 'Houston', country: 'United States', countryCode: 'US', lat: 29.8, lng: -95.4, population: 7_300_000, climate: 'tropical', wealth: 3,
    air: ['nyc', 'chi', 'lax', 'mia', 'mex', 'atl', 'dal'], sea: ['mia', 'mex'], land: ['dal', 'atl', 'mex'] },
  { id: 'dal', name: 'Dallas', country: 'United States', countryCode: 'US', lat: 32.8, lng: -96.8, population: 7_700_000, climate: 'arid', wealth: 3,
    air: ['nyc', 'chi', 'lax', 'mex', 'hou', 'atl', 'den', 'phx'], sea: [], land: ['hou', 'phx', 'den'] },
  { id: 'atl', name: 'Atlanta', country: 'United States', countryCode: 'US', lat: 33.7, lng: -84.4, population: 6_300_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'chi', 'mia', 'lax', 'hou', 'dal', 'was', 'bos'], sea: [], land: ['was', 'mia', 'hou'] },
  { id: 'bos', name: 'Boston', country: 'United States', countryCode: 'US', lat: 42.4, lng: -71.1, population: 4_900_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'chi', 'lon', 'par', 'atl', 'was'], sea: ['lon', 'nyc'], land: ['nyc', 'was'] },
  { id: 'phx', name: 'Phoenix', country: 'United States', countryCode: 'US', lat: 33.4, lng: -112.1, population: 5_000_000, climate: 'arid', wealth: 3,
    air: ['lax', 'chi', 'dal', 'den', 'sfo'], sea: [], land: ['lax', 'dal', 'den'] },
  { id: 'phi', name: 'Philadelphia', country: 'United States', countryCode: 'US', lat: 39.95, lng: -75.2, population: 6_200_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'chi', 'lon', 'was', 'bos', 'atl'], sea: ['nyc'], land: ['nyc', 'was'] },
  { id: 'was', name: 'Washington DC', country: 'United States', countryCode: 'US', lat: 38.9, lng: -77.0, population: 6_400_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'chi', 'lon', 'par', 'atl', 'bos', 'phi', 'fra'], sea: [], land: ['nyc', 'phi', 'atl', 'bos'] },
  { id: 'den', name: 'Denver', country: 'United States', countryCode: 'US', lat: 39.7, lng: -104.99, population: 3_000_000, climate: 'temperate', wealth: 3,
    air: ['chi', 'lax', 'dal', 'sfo', 'sea', 'phx'], sea: [], land: ['chi', 'dal', 'phx'] },
  { id: 'det', name: 'Detroit', country: 'United States', countryCode: 'US', lat: 42.3, lng: -83.0, population: 4_300_000, climate: 'temperate', wealth: 2,
    air: ['nyc', 'chi', 'tor', 'atl'], sea: [], land: ['chi', 'tor', 'nyc'] },
  { id: 'sfo', name: 'San Francisco', country: 'United States', countryCode: 'US', lat: 37.8, lng: -122.4, population: 4_700_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'chi', 'lax', 'sea', 'tok', 'hkg', 'sin', 'den'], sea: ['tok', 'sea'], land: ['lax', 'sea', 'den'] },

  // Canada (additional)
  { id: 'mtl', name: 'Montreal', country: 'Canada', countryCode: 'CA', lat: 45.5, lng: -73.6, population: 4_300_000, climate: 'temperate', wealth: 3,
    air: ['nyc', 'tor', 'par', 'lon', 'bos'], sea: ['nyc'], land: ['tor', 'nyc', 'bos', 'ott'] },
  { id: 'cgy', name: 'Calgary', country: 'Canada', countryCode: 'CA', lat: 51.05, lng: -114.07, population: 1_700_000, climate: 'arctic', wealth: 3,
    air: ['tor', 'van', 'sea', 'lon'], sea: [], land: ['van', 'tor'] },
  { id: 'ott', name: 'Ottawa', country: 'Canada', countryCode: 'CA', lat: 45.4, lng: -75.7, population: 1_500_000, climate: 'temperate', wealth: 3,
    air: ['tor', 'mtl', 'nyc', 'lon'], sea: [], land: ['tor', 'mtl', 'nyc'] },

  // Mexico (additional)
  { id: 'gdl', name: 'Guadalajara', country: 'Mexico', countryCode: 'MX', lat: 20.7, lng: -103.4, population: 5_300_000, climate: 'temperate', wealth: 2,
    air: ['mex', 'lax', 'hou', 'mia'], sea: [], land: ['mex', 'mty'] },
  { id: 'mty', name: 'Monterrey', country: 'Mexico', countryCode: 'MX', lat: 25.7, lng: -100.3, population: 5_400_000, climate: 'arid', wealth: 2,
    air: ['mex', 'hou', 'dal', 'mia'], sea: [], land: ['mex', 'gdl', 'hou', 'dal'] },

  // Brazil (additional)
  { id: 'bsb', name: 'Brasília', country: 'Brazil', countryCode: 'BR', lat: -15.8, lng: -47.9, population: 4_800_000, climate: 'tropical', wealth: 2,
    air: ['sao', 'rio', 'bhz', 'ssa', 'for'], sea: [], land: ['sao', 'rio', 'bhz'] },
  { id: 'bhz', name: 'Belo Horizonte', country: 'Brazil', countryCode: 'BR', lat: -19.9, lng: -43.9, population: 6_100_000, climate: 'tropical', wealth: 2,
    air: ['sao', 'rio', 'bsb', 'ssa'], sea: [], land: ['sao', 'rio', 'bsb'] },
  { id: 'ssa', name: 'Salvador', country: 'Brazil', countryCode: 'BR', lat: -12.97, lng: -38.5, population: 3_900_000, climate: 'tropical', wealth: 1,
    air: ['sao', 'rio', 'bsb', 'rec', 'for'], sea: ['rio', 'rec'], land: ['rec', 'for'] },
  { id: 'for', name: 'Fortaleza', country: 'Brazil', countryCode: 'BR', lat: -3.7, lng: -38.5, population: 4_100_000, climate: 'tropical', wealth: 1,
    air: ['sao', 'rio', 'bsb', 'rec', 'ssa', 'lis'], sea: ['rec', 'ssa'], land: ['rec', 'ssa'] },
  { id: 'cur', name: 'Curitiba', country: 'Brazil', countryCode: 'BR', lat: -25.4, lng: -49.3, population: 3_700_000, climate: 'temperate', wealth: 2,
    air: ['sao', 'rio', 'poa', 'bue'], sea: [], land: ['sao', 'poa'] },
  { id: 'rec', name: 'Recife', country: 'Brazil', countryCode: 'BR', lat: -8.05, lng: -34.9, population: 4_100_000, climate: 'tropical', wealth: 1,
    air: ['sao', 'rio', 'ssa', 'for', 'lis'], sea: ['ssa', 'for'], land: ['ssa', 'for'] },
  { id: 'poa', name: 'Porto Alegre', country: 'Brazil', countryCode: 'BR', lat: -30.0, lng: -51.2, population: 4_400_000, climate: 'temperate', wealth: 2,
    air: ['sao', 'rio', 'cur', 'bue'], sea: [], land: ['cur', 'sao', 'bue'] },

  // Argentina (additional)
  { id: 'cor', name: 'Córdoba', country: 'Argentina', countryCode: 'AR', lat: -31.4, lng: -64.2, population: 1_600_000, climate: 'temperate', wealth: 2,
    air: ['bue', 'scl', 'sao'], sea: [], land: ['bue', 'scl'] },

  // Chile
  { id: 'scl', name: 'Santiago', country: 'Chile', countryCode: 'CL', lat: -33.4, lng: -70.7, population: 6_900_000, climate: 'temperate', wealth: 3,
    air: ['bue', 'lim', 'sao', 'mad', 'mia'], sea: ['lim'], land: ['bue', 'cor'] },

  // Venezuela
  { id: 'ccs', name: 'Caracas', country: 'Venezuela', countryCode: 'VE', lat: 10.5, lng: -66.9, population: 2_900_000, climate: 'tropical', wealth: 1,
    air: ['mia', 'bog', 'mad', 'pty'], sea: ['mia'], land: ['bog'] },

  // Ecuador
  { id: 'uio', name: 'Quito', country: 'Ecuador', countryCode: 'EC', lat: -0.2, lng: -78.5, population: 2_000_000, climate: 'tropical', wealth: 1,
    air: ['bog', 'lim', 'gye', 'mia', 'mad'], sea: [], land: ['gye', 'bog'] },
  { id: 'gye', name: 'Guayaquil', country: 'Ecuador', countryCode: 'EC', lat: -2.2, lng: -79.9, population: 3_100_000, climate: 'tropical', wealth: 1,
    air: ['uio', 'mia', 'bog', 'lim'], sea: ['lim'], land: ['uio', 'lim'] },

  // Dominican Republic
  { id: 'sdq', name: 'Santo Domingo', country: 'Dominican Republic', countryCode: 'DO', lat: 18.5, lng: -69.9, population: 3_500_000, climate: 'tropical', wealth: 2,
    air: ['mia', 'nyc', 'mad', 'sju'], sea: ['mia'], land: [] },

  // Puerto Rico belongs to US -- skipping. Panama not in original target -- adding light reference
  { id: 'pty', name: 'Panama City', country: 'Panama', countryCode: 'PA', lat: 8.97, lng: -79.5, population: 1_900_000, climate: 'tropical', wealth: 2,
    air: ['mia', 'mex', 'bog', 'ccs', 'lim'], sea: ['mia'], land: ['bog'] },
  { id: 'sju', name: 'San Juan', country: 'United States', countryCode: 'US', lat: 18.5, lng: -66.1, population: 2_400_000, climate: 'tropical', wealth: 2,
    air: ['mia', 'nyc', 'sdq'], sea: ['mia'], land: [] },

  // United Kingdom (additional)
  { id: 'mnc', name: 'Manchester', country: 'United Kingdom', countryCode: 'GB', lat: 53.5, lng: -2.2, population: 2_800_000, climate: 'temperate', wealth: 3,
    air: ['lon', 'dbl', 'par', 'ams', 'nyc'], sea: ['lon'], land: ['lon', 'bhm'] },
  { id: 'bhm', name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB', lat: 52.5, lng: -1.9, population: 2_900_000, climate: 'temperate', wealth: 3,
    air: ['lon', 'dbl', 'par', 'ams'], sea: [], land: ['lon', 'mnc'] },

  // France (additional)
  { id: 'mrs', name: 'Marseille', country: 'France', countryCode: 'FR', lat: 43.3, lng: 5.4, population: 1_900_000, climate: 'temperate', wealth: 3,
    air: ['par', 'rom', 'cas', 'alg'], sea: ['rom', 'alg', 'bcn'], land: ['par', 'lys', 'bcn'] },
  { id: 'lys', name: 'Lyon', country: 'France', countryCode: 'FR', lat: 45.75, lng: 4.85, population: 2_300_000, climate: 'temperate', wealth: 3,
    air: ['par', 'lon', 'mil', 'rom'], sea: [], land: ['par', 'mrs', 'mil', 'zrh'] },

  // Spain (additional)
  { id: 'bcn', name: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.4, lng: 2.2, population: 5_700_000, climate: 'temperate', wealth: 3,
    air: ['mad', 'par', 'rom', 'lon', 'mrs'], sea: ['rom', 'mrs', 'mad'], land: ['mad', 'mrs', 'vlc'] },
  { id: 'vlc', name: 'Valencia', country: 'Spain', countryCode: 'ES', lat: 39.5, lng: -0.4, population: 1_600_000, climate: 'temperate', wealth: 3,
    air: ['mad', 'bcn', 'par', 'lon'], sea: ['bcn'], land: ['mad', 'bcn'] },

  // Germany (additional)
  { id: 'ham', name: 'Hamburg', country: 'Germany', countryCode: 'DE', lat: 53.55, lng: 10.0, population: 3_300_000, climate: 'temperate', wealth: 3,
    air: ['ber', 'fra', 'lon', 'cph'], sea: ['lon', 'ams', 'cph'], land: ['ber', 'fra', 'ams', 'cph'] },
  { id: 'muc', name: 'Munich', country: 'Germany', countryCode: 'DE', lat: 48.1, lng: 11.6, population: 3_000_000, climate: 'temperate', wealth: 3,
    air: ['ber', 'fra', 'lon', 'vie', 'zrh'], sea: [], land: ['ber', 'fra', 'vie', 'zrh', 'mil'] },
  { id: 'cgn', name: 'Cologne', country: 'Germany', countryCode: 'DE', lat: 50.9, lng: 6.95, population: 2_000_000, climate: 'temperate', wealth: 3,
    air: ['fra', 'ber', 'lon', 'par'], sea: [], land: ['fra', 'ber', 'ams', 'bru'] },

  // Italy (additional)
  { id: 'mil', name: 'Milan', country: 'Italy', countryCode: 'IT', lat: 45.5, lng: 9.2, population: 5_300_000, climate: 'temperate', wealth: 3,
    air: ['rom', 'par', 'lon', 'fra', 'muc', 'zrh'], sea: [], land: ['rom', 'zrh', 'muc', 'lys'] },
  { id: 'nap', name: 'Naples', country: 'Italy', countryCode: 'IT', lat: 40.85, lng: 14.3, population: 3_000_000, climate: 'temperate', wealth: 2,
    air: ['rom', 'mil', 'par'], sea: ['rom'], land: ['rom'] },

  // Poland
  { id: 'waw', name: 'Warsaw', country: 'Poland', countryCode: 'PL', lat: 52.2, lng: 21.0, population: 3_100_000, climate: 'temperate', wealth: 2,
    air: ['ber', 'fra', 'lon', 'par', 'mos', 'iev'], sea: [], land: ['ber', 'krk', 'iev'] },
  { id: 'krk', name: 'Kraków', country: 'Poland', countryCode: 'PL', lat: 50.07, lng: 19.95, population: 1_800_000, climate: 'temperate', wealth: 2,
    air: ['waw', 'ber', 'lon', 'fra'], sea: [], land: ['waw', 'prg', 'bud'] },

  // Ukraine
  { id: 'iev', name: 'Kyiv', country: 'Ukraine', countryCode: 'UA', lat: 50.45, lng: 30.5, population: 3_000_000, climate: 'temperate', wealth: 1,
    air: ['waw', 'ber', 'ist', 'mos'], sea: [], land: ['waw', 'mos', 'hrk', 'otp'] },
  { id: 'hrk', name: 'Kharkiv', country: 'Ukraine', countryCode: 'UA', lat: 49.99, lng: 36.23, population: 1_400_000, climate: 'temperate', wealth: 1,
    air: ['iev', 'mos', 'ist'], sea: [], land: ['iev', 'mos'] },

  // Russia (additional)
  { id: 'led', name: 'St Petersburg', country: 'Russia', countryCode: 'RU', lat: 59.95, lng: 30.3, population: 5_400_000, climate: 'arctic', wealth: 2,
    air: ['mos', 'ber', 'lon', 'hel'], sea: ['hel', 'sto'], land: ['mos', 'hel'] },
  { id: 'svx', name: 'Yekaterinburg', country: 'Russia', countryCode: 'RU', lat: 56.85, lng: 60.6, population: 1_500_000, climate: 'arctic', wealth: 2,
    air: ['mos', 'ist', 'kzn'], sea: [], land: ['mos', 'kzn', 'ovb'] },
  { id: 'ovb', name: 'Novosibirsk', country: 'Russia', countryCode: 'RU', lat: 55.0, lng: 82.9, population: 1_600_000, climate: 'arctic', wealth: 2,
    air: ['mos', 'beij', 'svx'], sea: [], land: ['mos', 'svx', 'ala'] },
  { id: 'kzn', name: 'Kazan', country: 'Russia', countryCode: 'RU', lat: 55.8, lng: 49.1, population: 1_300_000, climate: 'temperate', wealth: 2,
    air: ['mos', 'ist', 'svx'], sea: [], land: ['mos', 'svx'] },

  // Turkey (additional)
  { id: 'ank', name: 'Ankara', country: 'Turkey', countryCode: 'TR', lat: 39.93, lng: 32.85, population: 5_700_000, climate: 'temperate', wealth: 2,
    air: ['ist', 'mos', 'dub'], sea: [], land: ['ist', 'izm', 'teh'] },
  { id: 'izm', name: 'Izmir', country: 'Turkey', countryCode: 'TR', lat: 38.42, lng: 27.14, population: 4_400_000, climate: 'temperate', wealth: 2,
    air: ['ist', 'ank', 'ath'], sea: ['ath'], land: ['ist', 'ank'] },

  // Greece
  { id: 'ath', name: 'Athens', country: 'Greece', countryCode: 'GR', lat: 37.98, lng: 23.7, population: 3_800_000, climate: 'temperate', wealth: 2,
    air: ['ist', 'rom', 'lon', 'par', 'fra'], sea: ['rom', 'izm'], land: ['ist'] },

  // Sweden
  { id: 'sto', name: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.33, lng: 18.07, population: 2_400_000, climate: 'arctic', wealth: 3,
    air: ['cph', 'osl', 'hel', 'lon', 'fra', 'led'], sea: ['hel', 'cph', 'led'], land: ['osl'] },

  // Denmark
  { id: 'cph', name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', lat: 55.68, lng: 12.57, population: 2_100_000, climate: 'temperate', wealth: 3,
    air: ['sto', 'osl', 'ham', 'ber', 'lon', 'fra'], sea: ['sto', 'ham', 'osl'], land: ['ham', 'ber'] },

  // Finland
  { id: 'hel', name: 'Helsinki', country: 'Finland', countryCode: 'FI', lat: 60.17, lng: 24.94, population: 1_600_000, climate: 'arctic', wealth: 3,
    air: ['sto', 'led', 'mos', 'lon'], sea: ['sto', 'led'], land: ['led'] },

  // Norway
  { id: 'osl', name: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.91, lng: 10.75, population: 1_100_000, climate: 'arctic', wealth: 3,
    air: ['sto', 'cph', 'lon', 'ams'], sea: ['cph', 'sto'], land: ['sto'] },

  // Belgium
  { id: 'bru', name: 'Brussels', country: 'Belgium', countryCode: 'BE', lat: 50.85, lng: 4.35, population: 2_100_000, climate: 'temperate', wealth: 3,
    air: ['lon', 'par', 'fra', 'ber'], sea: [], land: ['par', 'ams', 'cgn', 'fra'] },

  // Austria
  { id: 'vie', name: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.21, lng: 16.37, population: 2_000_000, climate: 'temperate', wealth: 3,
    air: ['ber', 'fra', 'muc', 'lon', 'ist', 'zrh', 'bud', 'prg'], sea: [], land: ['muc', 'prg', 'bud', 'zrh'] },

  // Switzerland
  { id: 'zrh', name: 'Zurich', country: 'Switzerland', countryCode: 'CH', lat: 47.37, lng: 8.55, population: 1_400_000, climate: 'temperate', wealth: 3,
    air: ['par', 'lon', 'fra', 'muc', 'vie', 'mil'], sea: [], land: ['muc', 'mil', 'vie', 'lys'] },

  // Ireland (note: 'dub' is Dubai, so Dublin uses 'dbl')
  { id: 'dbl', name: 'Dublin', country: 'Ireland', countryCode: 'IE', lat: 53.35, lng: -6.26, population: 1_500_000, climate: 'temperate', wealth: 3,
    air: ['lon', 'mnc', 'nyc', 'par', 'fra', 'bos'], sea: ['lon'], land: [] },

  // Czechia
  { id: 'prg', name: 'Prague', country: 'Czechia', countryCode: 'CZ', lat: 50.08, lng: 14.44, population: 1_400_000, climate: 'temperate', wealth: 3,
    air: ['ber', 'fra', 'lon', 'par', 'vie'], sea: [], land: ['ber', 'vie', 'krk', 'muc'] },

  // Hungary
  { id: 'bud', name: 'Budapest', country: 'Hungary', countryCode: 'HU', lat: 47.5, lng: 19.04, population: 1_800_000, climate: 'temperate', wealth: 2,
    air: ['ber', 'fra', 'lon', 'vie', 'ist'], sea: [], land: ['vie', 'prg', 'krk', 'otp'] },

  // Romania
  { id: 'otp', name: 'Bucharest', country: 'Romania', countryCode: 'RO', lat: 44.43, lng: 26.1, population: 2_400_000, climate: 'temperate', wealth: 2,
    air: ['ist', 'ber', 'fra', 'lon', 'vie'], sea: [], land: ['bud', 'iev', 'ist'] },

  // Portugal (additional)
  { id: 'opo', name: 'Porto', country: 'Portugal', countryCode: 'PT', lat: 41.15, lng: -8.61, population: 1_700_000, climate: 'temperate', wealth: 3,
    air: ['lis', 'mad', 'par', 'lon'], sea: ['lis'], land: ['lis', 'mad'] },

  // Egypt (additional)
  { id: 'alx', name: 'Alexandria', country: 'Egypt', countryCode: 'EG', lat: 31.2, lng: 29.92, population: 5_400_000, climate: 'arid', wealth: 1,
    air: ['cai', 'ist', 'ath', 'rom'], sea: ['rom', 'ath', 'cai'], land: ['cai', 'giz'] },
  { id: 'giz', name: 'Giza', country: 'Egypt', countryCode: 'EG', lat: 30.01, lng: 31.21, population: 4_300_000, climate: 'arid', wealth: 1,
    air: ['cai', 'ist', 'dub'], sea: [], land: ['cai', 'alx'] },

  // Nigeria (additional)
  { id: 'kan', name: 'Kano', country: 'Nigeria', countryCode: 'NG', lat: 12.0, lng: 8.52, population: 4_100_000, climate: 'arid', wealth: 1,
    air: ['lag', 'abv', 'cai', 'dub'], sea: [], land: ['abv', 'lag', 'iba'] },
  { id: 'iba', name: 'Ibadan', country: 'Nigeria', countryCode: 'NG', lat: 7.39, lng: 3.9, population: 3_700_000, climate: 'tropical', wealth: 1,
    air: ['lag', 'abv'], sea: [], land: ['lag', 'abv', 'kan'] },
  { id: 'abv', name: 'Abuja', country: 'Nigeria', countryCode: 'NG', lat: 9.06, lng: 7.48, population: 3_800_000, climate: 'tropical', wealth: 1,
    air: ['lag', 'lon', 'cai', 'dub', 'jhb'], sea: [], land: ['lag', 'kan', 'iba', 'phc'] },
  { id: 'phc', name: 'Port Harcourt', country: 'Nigeria', countryCode: 'NG', lat: 4.82, lng: 7.05, population: 2_300_000, climate: 'tropical', wealth: 1,
    air: ['lag', 'abv', 'lon', 'jhb'], sea: ['lag'], land: ['lag', 'abv'] },

  // DR Congo
  { id: 'fih', name: 'Kinshasa', country: 'DR Congo', countryCode: 'CD', lat: -4.32, lng: 15.32, population: 15_600_000, climate: 'tropical', wealth: 1,
    air: ['lag', 'nai', 'jhb', 'lon', 'par', 'lad'], sea: [], land: ['lad'] },

  // Ethiopia
  { id: 'add', name: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', lat: 9.03, lng: 38.74, population: 5_500_000, climate: 'tropical', wealth: 1,
    air: ['nai', 'cai', 'dub', 'jhb', 'lon', 'krt'], sea: [], land: ['krt', 'nai'] },

  // Tanzania
  { id: 'dar', name: 'Dar es Salaam', country: 'Tanzania', countryCode: 'TZ', lat: -6.79, lng: 39.21, population: 7_400_000, climate: 'tropical', wealth: 1,
    air: ['nai', 'jhb', 'dub', 'add', 'mba'], sea: ['mba', 'mum'], land: ['nai', 'mba'] },

  // South Africa (additional)
  { id: 'cpt', name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.92, lng: 18.42, population: 4_800_000, climate: 'temperate', wealth: 2,
    air: ['jhb', 'lon', 'dub', 'sao', 'dur', 'syd'], sea: ['jhb', 'dur'], land: ['jhb', 'dur'] },
  { id: 'dur', name: 'Durban', country: 'South Africa', countryCode: 'ZA', lat: -29.86, lng: 31.02, population: 3_900_000, climate: 'tropical', wealth: 2,
    air: ['jhb', 'cpt', 'dub'], sea: ['cpt', 'jhb', 'mum'], land: ['jhb', 'cpt'] },

  // Kenya (additional)
  { id: 'mba', name: 'Mombasa', country: 'Kenya', countryCode: 'KE', lat: -4.04, lng: 39.67, population: 1_400_000, climate: 'tropical', wealth: 1,
    air: ['nai', 'dub', 'dar'], sea: ['mum', 'dar', 'dub'], land: ['nai', 'dar'] },

  // Sudan
  { id: 'krt', name: 'Khartoum', country: 'Sudan', countryCode: 'SD', lat: 15.5, lng: 32.55, population: 6_300_000, climate: 'arid', wealth: 1,
    air: ['cai', 'dub', 'add', 'ist'], sea: [], land: ['cai', 'add'] },

  // Algeria
  { id: 'alg', name: 'Algiers', country: 'Algeria', countryCode: 'DZ', lat: 36.75, lng: 3.06, population: 3_400_000, climate: 'arid', wealth: 2,
    air: ['par', 'mrs', 'cas', 'cai', 'ist'], sea: ['mrs', 'cas'], land: ['cas'] },

  // Angola
  { id: 'lad', name: 'Luanda', country: 'Angola', countryCode: 'AO', lat: -8.84, lng: 13.23, population: 9_000_000, climate: 'tropical', wealth: 1,
    air: ['lis', 'lon', 'jhb', 'fih', 'sao'], sea: ['lis'], land: ['fih'] },

  // Ghana
  { id: 'acc', name: 'Accra', country: 'Ghana', countryCode: 'GH', lat: 5.6, lng: -0.19, population: 2_600_000, climate: 'tropical', wealth: 1,
    air: ['lag', 'lon', 'par', 'dub', 'nyc'], sea: ['lag'], land: ['lag', 'kms'] },
  { id: 'kms', name: 'Kumasi', country: 'Ghana', countryCode: 'GH', lat: 6.69, lng: -1.62, population: 3_300_000, climate: 'tropical', wealth: 1,
    air: ['acc', 'lag'], sea: [], land: ['acc'] },

  // Iraq
  { id: 'bgw', name: 'Baghdad', country: 'Iraq', countryCode: 'IQ', lat: 33.32, lng: 44.42, population: 7_800_000, climate: 'arid', wealth: 1,
    air: ['ist', 'dub', 'teh', 'cai'], sea: [], land: ['teh', 'dam', 'amm'] },

  // Afghanistan
  { id: 'kbl', name: 'Kabul', country: 'Afghanistan', countryCode: 'AF', lat: 34.53, lng: 69.17, population: 4_600_000, climate: 'arid', wealth: 1,
    air: ['dub', 'del', 'teh', 'isb'], sea: [], land: ['teh', 'isb'] },

  // Syria
  { id: 'dam', name: 'Damascus', country: 'Syria', countryCode: 'SY', lat: 33.51, lng: 36.29, population: 2_500_000, climate: 'arid', wealth: 1,
    air: ['dub', 'ist', 'bey'], sea: [], land: ['bey', 'amm', 'bgw'] },

  // Yemen
  { id: 'san', name: 'Sanaa', country: 'Yemen', countryCode: 'YE', lat: 15.36, lng: 44.21, population: 3_300_000, climate: 'arid', wealth: 1,
    air: ['dub', 'cai', 'rid'], sea: [], land: ['rid'] },

  // Saudi Arabia (additional)
  { id: 'jed', name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.49, lng: 39.18, population: 4_700_000, climate: 'arid', wealth: 2,
    air: ['rid', 'dub', 'cai', 'ist', 'mum'], sea: ['cai'], land: ['rid'] },

  // Iran (additional)
  { id: 'mhd', name: 'Mashhad', country: 'Iran', countryCode: 'IR', lat: 36.3, lng: 59.6, population: 3_400_000, climate: 'arid', wealth: 1,
    air: ['teh', 'dub', 'ist'], sea: [], land: ['teh', 'kbl'] },
  { id: 'ifn', name: 'Esfahan', country: 'Iran', countryCode: 'IR', lat: 32.65, lng: 51.67, population: 2_200_000, climate: 'arid', wealth: 1,
    air: ['teh', 'dub'], sea: [], land: ['teh'] },

  // UAE (additional)
  { id: 'auh', name: 'Abu Dhabi', country: 'UAE', countryCode: 'AE', lat: 24.47, lng: 54.37, population: 1_500_000, climate: 'arid', wealth: 3,
    air: ['dub', 'lon', 'par', 'fra', 'mum', 'del', 'sin', 'bkk'], sea: ['mum'], land: ['dub', 'rid'] },

  // Lebanon
  { id: 'bey', name: 'Beirut', country: 'Lebanon', countryCode: 'LB', lat: 33.89, lng: 35.5, population: 2_400_000, climate: 'temperate', wealth: 2,
    air: ['ist', 'par', 'dub', 'rom'], sea: ['rom'], land: ['dam'] },

  // Israel
  { id: 'tlv', name: 'Tel Aviv', country: 'Israel', countryCode: 'IL', lat: 32.08, lng: 34.78, population: 4_500_000, climate: 'arid', wealth: 3,
    air: ['nyc', 'lon', 'par', 'fra', 'ist', 'dub', 'rom', 'ath'], sea: ['rom', 'ath'], land: ['amm'] },

  // Jordan
  { id: 'amm', name: 'Amman', country: 'Jordan', countryCode: 'JO', lat: 31.95, lng: 35.93, population: 4_500_000, climate: 'arid', wealth: 2,
    air: ['dub', 'ist', 'cai', 'lon'], sea: [], land: ['tlv', 'dam', 'bgw'] },

  // India (additional)
  { id: 'blr', name: 'Bangalore', country: 'India', countryCode: 'IN', lat: 12.97, lng: 77.59, population: 13_600_000, climate: 'tropical', wealth: 2,
    air: ['mum', 'del', 'dub', 'sin', 'lon', 'maa', 'hyd'], sea: [], land: ['maa', 'hyd', 'mum'] },
  { id: 'ccu', name: 'Kolkata', country: 'India', countryCode: 'IN', lat: 22.57, lng: 88.36, population: 15_300_000, climate: 'tropical', wealth: 1,
    air: ['del', 'mum', 'bkk', 'dac', 'sin'], sea: ['sin', 'dac'], land: ['dac', 'del'] },
  { id: 'maa', name: 'Chennai', country: 'India', countryCode: 'IN', lat: 13.08, lng: 80.27, population: 11_500_000, climate: 'tropical', wealth: 1,
    air: ['del', 'mum', 'dub', 'sin', 'blr'], sea: ['sin', 'dub'], land: ['blr', 'hyd'] },
  { id: 'hyd', name: 'Hyderabad', country: 'India', countryCode: 'IN', lat: 17.39, lng: 78.49, population: 10_800_000, climate: 'tropical', wealth: 2,
    air: ['del', 'mum', 'dub', 'blr'], sea: [], land: ['blr', 'maa', 'mum'] },
  { id: 'amd', name: 'Ahmedabad', country: 'India', countryCode: 'IN', lat: 23.03, lng: 72.58, population: 8_400_000, climate: 'arid', wealth: 2,
    air: ['del', 'mum', 'dub'], sea: ['mum'], land: ['mum', 'del', 'pnq'] },
  { id: 'pnq', name: 'Pune', country: 'India', countryCode: 'IN', lat: 18.52, lng: 73.86, population: 7_400_000, climate: 'tropical', wealth: 2,
    air: ['mum', 'del', 'dub'], sea: [], land: ['mum', 'hyd', 'amd'] },
  { id: 'stv', name: 'Surat', country: 'India', countryCode: 'IN', lat: 21.17, lng: 72.83, population: 7_500_000, climate: 'tropical', wealth: 1,
    air: ['mum', 'del'], sea: ['mum'], land: ['mum', 'amd'] },
  { id: 'jai', name: 'Jaipur', country: 'India', countryCode: 'IN', lat: 26.92, lng: 75.78, population: 4_100_000, climate: 'arid', wealth: 1,
    air: ['del', 'mum', 'dub'], sea: [], land: ['del', 'amd'] },
  { id: 'luc', name: 'Lucknow', country: 'India', countryCode: 'IN', lat: 26.85, lng: 80.95, population: 3_900_000, climate: 'tropical', wealth: 1,
    air: ['del', 'mum'], sea: [], land: ['del', 'ccu'] },

  // Pakistan (additional)
  { id: 'lhe', name: 'Lahore', country: 'Pakistan', countryCode: 'PK', lat: 31.55, lng: 74.34, population: 14_400_000, climate: 'arid', wealth: 1,
    air: ['dub', 'kar', 'del', 'isb'], sea: [], land: ['kar', 'isb', 'del'] },
  { id: 'isb', name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', lat: 33.68, lng: 73.05, population: 2_400_000, climate: 'arid', wealth: 2,
    air: ['dub', 'kar', 'lhe', 'lon', 'kbl'], sea: [], land: ['lhe', 'kar', 'kbl'] },
  { id: 'lyp', name: 'Faisalabad', country: 'Pakistan', countryCode: 'PK', lat: 31.42, lng: 73.08, population: 3_700_000, climate: 'arid', wealth: 1,
    air: ['kar', 'lhe', 'dub'], sea: [], land: ['lhe', 'isb', 'kar'] },

  // Bangladesh (additional)
  { id: 'cgp', name: 'Chittagong', country: 'Bangladesh', countryCode: 'BD', lat: 22.36, lng: 91.78, population: 5_300_000, climate: 'tropical', wealth: 1,
    air: ['dac', 'sin', 'bkk', 'dub'], sea: ['sin', 'ccu'], land: ['dac', 'ccu'] },

  // China (additional)
  { id: 'can', name: 'Guangzhou', country: 'China', countryCode: 'CN', lat: 23.13, lng: 113.26, population: 18_700_000, climate: 'tropical', wealth: 2,
    air: ['hkg', 'sha', 'beij', 'szx', 'sin', 'bkk', 'tok'], sea: ['hkg', 'sin'], land: ['hkg', 'szx', 'sha'] },
  { id: 'szx', name: 'Shenzhen', country: 'China', countryCode: 'CN', lat: 22.54, lng: 114.06, population: 17_600_000, climate: 'tropical', wealth: 2,
    air: ['hkg', 'beij', 'sha', 'can', 'sin', 'tok'], sea: ['hkg', 'sin', 'sha'], land: ['hkg', 'can'] },
  { id: 'ctu', name: 'Chengdu', country: 'China', countryCode: 'CN', lat: 30.57, lng: 104.07, population: 16_900_000, climate: 'temperate', wealth: 2,
    air: ['beij', 'sha', 'hkg', 'ckg', 'wuh'], sea: [], land: ['ckg', 'xiy', 'wuh'] },
  { id: 'tsn', name: 'Tianjin', country: 'China', countryCode: 'CN', lat: 39.08, lng: 117.2, population: 13_900_000, climate: 'temperate', wealth: 2,
    air: ['beij', 'sha', 'sel'], sea: ['sha', 'tok'], land: ['beij'] },
  { id: 'ckg', name: 'Chongqing', country: 'China', countryCode: 'CN', lat: 29.56, lng: 106.55, population: 16_300_000, climate: 'tropical', wealth: 2,
    air: ['beij', 'sha', 'ctu', 'hkg', 'wuh'], sea: [], land: ['ctu', 'wuh', 'xiy'] },
  { id: 'wuh', name: 'Wuhan', country: 'China', countryCode: 'CN', lat: 30.59, lng: 114.31, population: 12_300_000, climate: 'temperate', wealth: 2,
    air: ['beij', 'sha', 'hkg', 'ckg', 'ctu'], sea: [], land: ['sha', 'ckg', 'ctu', 'nkg'] },
  { id: 'xiy', name: "Xi'an", country: 'China', countryCode: 'CN', lat: 34.34, lng: 108.94, population: 13_200_000, climate: 'temperate', wealth: 2,
    air: ['beij', 'sha', 'ctu'], sea: [], land: ['beij', 'ctu', 'ckg'] },
  { id: 'hgh', name: 'Hangzhou', country: 'China', countryCode: 'CN', lat: 30.27, lng: 120.16, population: 12_400_000, climate: 'temperate', wealth: 2,
    air: ['sha', 'beij', 'hkg', 'tok', 'sel'], sea: ['sha'], land: ['sha', 'suz', 'nkg'] },
  { id: 'suz', name: 'Suzhou', country: 'China', countryCode: 'CN', lat: 31.3, lng: 120.62, population: 12_800_000, climate: 'temperate', wealth: 2,
    air: ['sha', 'beij'], sea: ['sha'], land: ['sha', 'hgh', 'nkg'] },
  { id: 'nkg', name: 'Nanjing', country: 'China', countryCode: 'CN', lat: 32.06, lng: 118.8, population: 9_500_000, climate: 'temperate', wealth: 2,
    air: ['sha', 'beij', 'hkg'], sea: [], land: ['sha', 'suz', 'hgh', 'wuh'] },
  { id: 'tao', name: 'Qingdao', country: 'China', countryCode: 'CN', lat: 36.07, lng: 120.38, population: 9_200_000, climate: 'temperate', wealth: 2,
    air: ['beij', 'sha', 'sel', 'tok'], sea: ['sha', 'sel', 'tok'], land: ['beij'] },

  // Japan (additional)
  { id: 'osa', name: 'Osaka', country: 'Japan', countryCode: 'JP', lat: 34.69, lng: 135.5, population: 19_000_000, climate: 'temperate', wealth: 3,
    air: ['tok', 'sel', 'hkg', 'sha', 'sin', 'ngo'], sea: ['tok', 'sha'], land: ['tok', 'ngo'] },
  { id: 'ngo', name: 'Nagoya', country: 'Japan', countryCode: 'JP', lat: 35.18, lng: 136.91, population: 9_500_000, climate: 'temperate', wealth: 3,
    air: ['tok', 'osa', 'sel', 'hkg'], sea: ['tok'], land: ['tok', 'osa'] },
  { id: 'fuk', name: 'Fukuoka', country: 'Japan', countryCode: 'JP', lat: 33.59, lng: 130.4, population: 2_600_000, climate: 'temperate', wealth: 3,
    air: ['tok', 'osa', 'sel', 'pus', 'sha'], sea: ['pus', 'sel'], land: ['osa', 'tok'] },
  { id: 'spk', name: 'Sapporo', country: 'Japan', countryCode: 'JP', lat: 43.07, lng: 141.35, population: 2_700_000, climate: 'arctic', wealth: 3,
    air: ['tok', 'sel', 'osa'], sea: ['tok'], land: ['tok'] },

  // South Korea (additional)
  { id: 'pus', name: 'Busan', country: 'South Korea', countryCode: 'KR', lat: 35.18, lng: 129.08, population: 3_400_000, climate: 'temperate', wealth: 3,
    air: ['sel', 'tok', 'fuk', 'sha', 'hkg'], sea: ['tok', 'fuk', 'sha'], land: ['sel'] },

  // North Korea
  { id: 'fnj', name: 'Pyongyang', country: 'North Korea', countryCode: 'KP', lat: 39.02, lng: 125.75, population: 3_200_000, climate: 'temperate', wealth: 1,
    air: ['beij'], sea: [], land: ['beij', 'sel'] },

  // Vietnam
  { id: 'sgn', name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', lat: 10.82, lng: 106.63, population: 9_300_000, climate: 'tropical', wealth: 1,
    air: ['bkk', 'sin', 'hkg', 'han', 'tok', 'sel'], sea: ['sin', 'hkg'], land: ['han', 'bkk'] },
  { id: 'han', name: 'Hanoi', country: 'Vietnam', countryCode: 'VN', lat: 21.03, lng: 105.85, population: 8_700_000, climate: 'tropical', wealth: 1,
    air: ['bkk', 'sin', 'hkg', 'sgn', 'beij', 'sel'], sea: ['hkg'], land: ['sgn', 'beij'] },

  // Malaysia
  { id: 'kul', name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 3.14, lng: 101.69, population: 8_400_000, climate: 'tropical', wealth: 2,
    air: ['sin', 'bkk', 'jak', 'hkg', 'mum', 'del', 'dub', 'syd'], sea: ['sin', 'jak'], land: ['sin', 'bkk'] },

  // Myanmar
  { id: 'rgn', name: 'Yangon', country: 'Myanmar', countryCode: 'MM', lat: 16.87, lng: 96.2, population: 5_600_000, climate: 'tropical', wealth: 1,
    air: ['bkk', 'sin', 'dac', 'kul'], sea: ['sin'], land: ['bkk', 'dac'] },

  // Indonesia (additional)
  { id: 'sub', name: 'Surabaya', country: 'Indonesia', countryCode: 'ID', lat: -7.25, lng: 112.75, population: 9_900_000, climate: 'tropical', wealth: 2,
    air: ['jak', 'sin', 'kul', 'bkk'], sea: ['jak', 'sin'], land: ['jak'] },
  { id: 'bdg', name: 'Bandung', country: 'Indonesia', countryCode: 'ID', lat: -6.91, lng: 107.61, population: 8_900_000, climate: 'tropical', wealth: 2,
    air: ['jak', 'sin', 'kul'], sea: [], land: ['jak', 'sub'] },

  // Philippines (additional)
  { id: 'dvo', name: 'Davao', country: 'Philippines', countryCode: 'PH', lat: 7.07, lng: 125.61, population: 1_800_000, climate: 'tropical', wealth: 1,
    air: ['man', 'ceb', 'sin', 'hkg'], sea: ['man', 'ceb'], land: [] },
  { id: 'ceb', name: 'Cebu', country: 'Philippines', countryCode: 'PH', lat: 10.32, lng: 123.9, population: 3_000_000, climate: 'tropical', wealth: 1,
    air: ['man', 'dvo', 'hkg', 'sin', 'tok'], sea: ['man', 'dvo'], land: [] },

  // Kazakhstan
  { id: 'ala', name: 'Almaty', country: 'Kazakhstan', countryCode: 'KZ', lat: 43.25, lng: 76.95, population: 2_100_000, climate: 'arid', wealth: 2,
    air: ['mos', 'ist', 'dub', 'tas', 'ovb'], sea: [], land: ['ovb', 'tas'] },

  // Uzbekistan
  { id: 'tas', name: 'Tashkent', country: 'Uzbekistan', countryCode: 'UZ', lat: 41.3, lng: 69.24, population: 3_000_000, climate: 'arid', wealth: 2,
    air: ['mos', 'ist', 'dub', 'ala', 'del'], sea: [], land: ['ala'] },

  // Australia (additional)
  { id: 'mel', name: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.81, lng: 144.96, population: 5_200_000, climate: 'temperate', wealth: 3,
    air: ['syd', 'lax', 'lon', 'sin', 'hkg', 'tok', 'auc', 'per', 'bne'], sea: ['syd', 'auc'], land: ['syd', 'bne'] },
  { id: 'bne', name: 'Brisbane', country: 'Australia', countryCode: 'AU', lat: -27.47, lng: 153.03, population: 2_700_000, climate: 'tropical', wealth: 3,
    air: ['syd', 'mel', 'sin', 'hkg', 'auc', 'lax'], sea: ['syd', 'auc'], land: ['syd', 'mel'] },
  { id: 'per', name: 'Perth', country: 'Australia', countryCode: 'AU', lat: -31.95, lng: 115.86, population: 2_200_000, climate: 'arid', wealth: 3,
    air: ['syd', 'mel', 'sin', 'kul', 'jak', 'dub'], sea: ['sin'], land: [] },
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
  healthcareCapacity: 0.002 * s.wealth * s.wealth,
  healthcareLoad: 0,
  strainState: {},
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
