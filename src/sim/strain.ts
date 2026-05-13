import type { City, Pathogen, Strain, StrainCompartment } from './types';

export const ORIGIN_STRAIN_ID = 'origin';

export function originAsStrain(p: Pathogen): Strain {
  return {
    id: ORIGIN_STRAIN_ID,
    name: p.name,
    parentId: null,
    mutations: p.mutations,
    spawnedDay: 0,
    transmissibility: p.transmissibility,
    incubation: p.incubation,
    infectiousPeriod: p.infectiousPeriod,
    lethality: p.lethality,
    severity: p.severity,
    drugResistance: p.drugResistance,
    climateTolerance: p.climateTolerance,
  };
}

export function allStrains(p: Pathogen): Strain[] {
  return [originAsStrain(p), ...p.variants];
}

export function findStrain(p: Pathogen, id: string): Strain | undefined {
  if (id === ORIGIN_STRAIN_ID) return originAsStrain(p);
  return p.variants.find((v) => v.id === id);
}

export function makeEmptyCompartment(): StrainCompartment {
  return { E: 0, I: 0, R: 0 };
}

export function ensureStrainCompartment(city: City, strainId: string): City {
  if (city.strainState[strainId]) return city;
  return {
    ...city,
    strainState: { ...city.strainState, [strainId]: makeEmptyCompartment() },
  };
}

export function cityTotals(city: City): { E: number; I: number; R: number } {
  let E = 0, I = 0, R = 0;
  for (const s of Object.values(city.strainState)) {
    E += s.E; I += s.I; R += s.R;
  }
  return { E, I, R };
}

export function activeStrainIdsInCity(city: City): string[] {
  const ids: string[] = [];
  for (const [id, s] of Object.entries(city.strainState)) {
    if (s.E > 0 || s.I > 0) ids.push(id);
  }
  return ids;
}

export function recomputeCityAggregates(city: City): City {
  const { E, I, R } = cityTotals(city);
  if (city.E === E && city.I === I && city.R === R) return city;
  return { ...city, E, I, R };
}

export function makeVariantStrain(opts: {
  id: string;
  name: string;
  parentStrain: Strain;
  newMutationId: string;
  effect?: Partial<Pick<Strain, 'transmissibility' | 'incubation' | 'infectiousPeriod' | 'lethality' | 'severity' | 'drugResistance' | 'climateTolerance'>>;
  spawnedDay: number;
}): Strain {
  const mutations = new Set(opts.parentStrain.mutations);
  mutations.add(opts.newMutationId);
  return {
    id: opts.id,
    name: opts.name,
    parentId: opts.parentStrain.id,
    mutations,
    spawnedDay: opts.spawnedDay,
    transmissibility: opts.effect?.transmissibility ?? opts.parentStrain.transmissibility,
    incubation: opts.effect?.incubation ?? opts.parentStrain.incubation,
    infectiousPeriod: opts.effect?.infectiousPeriod ?? opts.parentStrain.infectiousPeriod,
    lethality: opts.effect?.lethality ?? opts.parentStrain.lethality,
    severity: opts.effect?.severity ?? opts.parentStrain.severity,
    drugResistance: opts.effect?.drugResistance ?? opts.parentStrain.drugResistance,
    climateTolerance: opts.effect?.climateTolerance
      ? { ...opts.parentStrain.climateTolerance, ...opts.effect.climateTolerance }
      : { ...opts.parentStrain.climateTolerance },
  };
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const m of a) if (b.has(m)) inter++;
  const union = a.size + b.size - inter;
  return union > 0 ? inter / union : 0;
}

export function crossImmunity(a: Strain, b: Strain): number {
  if (a.id === b.id) return 1;
  const j = jaccardSimilarity(a.mutations, b.mutations);
  return 0.4 + 0.5 * j;
}
