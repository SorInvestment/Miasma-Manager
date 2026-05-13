import type { City, Pathogen, Strain, StrainCompartment } from './types';
import { LOCKDOWN_BETA_MULT, PUBLIC_INFO_GLOBAL_BETA_MULT } from './constants';
import { lockdownEffectMultiplier, COMPLIANCE_MAX } from './compliance';
import {
  ORIGIN_STRAIN_ID,
  originAsStrain,
  cityTotals,
  makeEmptyCompartment,
} from './strain';

export interface SEIRMods {
  publicInfoActive: boolean;
  compliance?: number;
}

export function effectiveBeta(
  city: City,
  pOrStrain: Pathogen | Strain,
  mods: SEIRMods,
): number {
  const climateMod = pOrStrain.climateTolerance[city.climate];
  const compliance = mods.compliance ?? COMPLIANCE_MAX;
  const lockdownMod = city.interventions.has('lockdown')
    ? lockdownEffectMultiplier(LOCKDOWN_BETA_MULT, compliance)
    : 1;
  const publicInfoMod = mods.publicInfoActive ? PUBLIC_INFO_GLOBAL_BETA_MULT : 1;
  return Math.max(0, pOrStrain.transmissibility * climateMod * lockdownMod * publicInfoMod);
}

export function healthcareCollapseMultiplier(city: City, severity: number): number {
  const surgeActive = city.interventions.has('healthcare-surge');
  const effectiveCapacity = surgeActive ? city.healthcareCapacity * 2.5 : city.healthcareCapacity;
  const severeFraction = Math.max(0, severity) * 0.6;
  const load = (city.I * severeFraction) / Math.max(1, city.population);
  const ratio = load / Math.max(0.0005, effectiveCapacity);
  return ratio > 1 ? Math.min(3.5, 1 + (ratio - 1) * 1.8) : 1;
}

function ensureOriginCompartment(city: City): { strainState: Record<string, StrainCompartment>; mutated: boolean } {
  const totals = cityTotals(city);
  const tracked = totals.E + totals.I + totals.R;
  const reported = city.E + city.I + city.R;
  if (Math.abs(tracked - reported) < 0.5) {
    return { strainState: city.strainState, mutated: false };
  }
  const origin = city.strainState[ORIGIN_STRAIN_ID] ?? makeEmptyCompartment();
  const next: StrainCompartment = {
    E: origin.E + (city.E - totals.E),
    I: origin.I + (city.I - totals.I),
    R: origin.R + (city.R - totals.R),
  };
  return {
    strainState: { ...city.strainState, [ORIGIN_STRAIN_ID]: next },
    mutated: true,
  };
}

export function tickCity(
  city: City,
  pathogen: Pathogen,
  mods: SEIRMods = { publicInfoActive: false },
): City {
  const N0 = city.S + city.E + city.I + city.R;
  if (N0 <= 0) return city;

  const ensured = ensureOriginCompartment(city);
  let strainState = { ...ensured.strainState };

  const severeFraction = Math.max(0, pathogen.severity) * 0.6;
  const healthcareLoad = (city.I * severeFraction) / Math.max(1, city.population);

  const allStrainEntries: { id: string; strain: Strain; comp: StrainCompartment }[] = [];
  const origin = originAsStrain(pathogen);
  const originComp = strainState[ORIGIN_STRAIN_ID] ?? makeEmptyCompartment();
  allStrainEntries.push({ id: ORIGIN_STRAIN_ID, strain: origin, comp: originComp });
  for (const variant of pathogen.variants) {
    const comp = strainState[variant.id] ?? makeEmptyCompartment();
    allStrainEntries.push({ id: variant.id, strain: variant, comp });
  }

  const activeEntries = allStrainEntries.filter((e) => e.comp.E > 0 || e.comp.I > 0);

  if (activeEntries.length === 0) {
    if (city.healthcareLoad === healthcareLoad && !ensured.mutated) return city;
    return ensured.mutated ? { ...city, strainState, healthcareLoad } : { ...city, healthcareLoad };
  }

  const collapseMult = healthcareCollapseMultiplier({ ...city, I: city.I }, pathogen.severity);

  const N = N0;
  const demands: number[] = activeEntries.map(({ strain, comp }) => {
    const beta = effectiveBeta(city, strain, mods);
    return (beta * city.S * comp.I) / Math.max(1, N);
  });
  const totalDemand = demands.reduce((a, b) => a + b, 0);
  const scale = totalDemand > city.S && totalDemand > 0 ? city.S / totalDemand : 1;

  let nextS = city.S;
  let nextD = city.D;

  for (let i = 0; i < activeEntries.length; i++) {
    const entry = activeEntries[i];
    const { strain, comp } = entry;
    const newE = Math.min(nextS, demands[i] * scale);
    const sigma = 1 / Math.max(0.5, strain.incubation);
    const gamma = 1 / Math.max(0.5, strain.infectiousPeriod);
    const baseMu = Math.max(0, Math.min(1, strain.lethality));
    const mu = Math.min(1, baseMu * collapseMult);
    const newI = Math.min(comp.E, sigma * comp.E);
    const outI = Math.min(comp.I, gamma * comp.I);
    const died = outI * mu;
    const recovered = outI - died;
    const nextComp: StrainCompartment = {
      E: Math.max(0, comp.E + newE - newI),
      I: Math.max(0, comp.I + newI - recovered - died),
      R: comp.R + recovered,
    };
    strainState[entry.id] = nextComp;
    nextS = Math.max(0, nextS - newE);
    nextD += died;
  }

  let totalE = 0, totalI = 0, totalR = 0;
  for (const s of Object.values(strainState)) {
    totalE += s.E; totalI += s.I; totalR += s.R;
  }

  return {
    ...city,
    S: nextS,
    E: totalE,
    I: totalI,
    R: totalR,
    D: nextD,
    strainState,
    healthcareLoad: (totalI * severeFraction) / Math.max(1, city.population),
  };
}
