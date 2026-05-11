import type { City, Pathogen } from './types';
import { LOCKDOWN_BETA_MULT, HEALTHCARE_LETHALITY_MULT, PUBLIC_INFO_GLOBAL_BETA_MULT } from './constants';

export interface SEIRMods {
  publicInfoActive: boolean;
}

export function effectiveBeta(city: City, p: Pathogen, mods: SEIRMods): number {
  const climateMod = p.climateTolerance[city.climate];
  const lockdownMod = city.interventions.has('lockdown') ? LOCKDOWN_BETA_MULT : 1;
  const publicInfoMod = mods.publicInfoActive ? PUBLIC_INFO_GLOBAL_BETA_MULT : 1;
  return Math.max(0, p.transmissibility * climateMod * lockdownMod * publicInfoMod);
}

export function tickCity(city: City, p: Pathogen, mods: SEIRMods = { publicInfoActive: false }): City {
  const N = city.S + city.E + city.I + city.R;
  if (N <= 0) return city;
  if (city.I <= 0 && city.E <= 0) return city;

  const beta = effectiveBeta(city, p, mods);
  const sigma = 1 / Math.max(0.5, p.incubation);
  const gamma = 1 / Math.max(0.5, p.infectiousPeriod);
  const baseMu = Math.max(0, Math.min(1, p.lethality));
  const healthcareMod = city.interventions.has('healthcare-surge') ? HEALTHCARE_LETHALITY_MULT : 1;
  const mu = baseMu * healthcareMod;

  const newE = Math.min(city.S, (beta * city.S * city.I) / N);
  const newI = Math.min(city.E, sigma * city.E);
  const outI = Math.min(city.I, gamma * city.I);
  const died = outI * mu;
  const recovered = outI - died;

  return {
    ...city,
    S: Math.max(0, city.S - newE),
    E: Math.max(0, city.E + newE - newI),
    I: Math.max(0, city.I + newI - recovered - died),
    R: city.R + recovered,
    D: city.D + died,
  };
}
