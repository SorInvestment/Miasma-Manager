import type { Mutation, Pathogen, GameState, GameEvent, Strain } from './types';
import { MUTATIONS } from '../data/mutations';
import { applyStageRollback } from './cure';
import { allStrains, makeVariantStrain, ORIGIN_STRAIN_ID } from './strain';

export function getMutationById(id: string): Mutation | undefined {
  return MUTATIONS.find((m) => m.id === id);
}

export function applyMutationEffect(p: Pathogen, m: Mutation): Pathogen {
  const next: Pathogen = {
    ...p,
    mutations: new Set(p.mutations),
    climateTolerance: { ...p.climateTolerance },
    variants: p.variants,
  };
  next.mutations.add(m.id);
  const e = m.effect;
  if (e.transmissibility !== undefined) next.transmissibility += e.transmissibility;
  if (e.incubation !== undefined) next.incubation = Math.max(0.5, next.incubation + e.incubation);
  if (e.infectiousPeriod !== undefined) next.infectiousPeriod = Math.max(0.5, next.infectiousPeriod + e.infectiousPeriod);
  if (e.lethality !== undefined) next.lethality = Math.max(0, Math.min(1, next.lethality + e.lethality));
  if (e.severity !== undefined) next.severity = Math.max(0, next.severity + e.severity);
  if (e.drugResistance !== undefined) next.drugResistance = Math.max(0, next.drugResistance + e.drugResistance);
  if (e.climateTolerance) {
    for (const [k, v] of Object.entries(e.climateTolerance)) {
      const key = k as keyof Pathogen['climateTolerance'];
      next.climateTolerance[key] = Math.max(0, (next.climateTolerance[key] ?? 1) + (v as number));
    }
  }
  return next;
}

export function canAfford(state: GameState, m: Mutation): boolean {
  return state.dnaPoints >= m.cost;
}

export function pathogenTypeAllowed(p: Pathogen, m: Mutation): boolean {
  if (!m.pathogenTypeOnly) return true;
  return m.pathogenTypeOnly.includes(p.type);
}

export function prereqsMet(p: Pathogen, m: Mutation): boolean {
  return m.prereqs.every((id) => p.mutations.has(id));
}

function variantStatsFromMutation(parent: Strain, m: Mutation) {
  const e = m.effect;
  const climateTolerance = { ...parent.climateTolerance };
  if (e.climateTolerance) {
    for (const [k, v] of Object.entries(e.climateTolerance)) {
      const key = k as keyof Strain['climateTolerance'];
      climateTolerance[key] = Math.max(0, (climateTolerance[key] ?? 1) + (v as number));
    }
  }
  return {
    transmissibility: parent.transmissibility + (e.transmissibility ?? 0),
    incubation: Math.max(0.5, parent.incubation + (e.incubation ?? 0)),
    infectiousPeriod: Math.max(0.5, parent.infectiousPeriod + (e.infectiousPeriod ?? 0)),
    lethality: Math.max(0, Math.min(1, parent.lethality + (e.lethality ?? 0))),
    severity: Math.max(0, parent.severity + (e.severity ?? 0)),
    drugResistance: Math.max(0, parent.drugResistance + (e.drugResistance ?? 0)),
    climateTolerance,
  };
}

export function spawnVariantStrain(state: GameState, m: Mutation): GameState {
  const strains = allStrains(state.pathogen);
  const parent = strains[strains.length - 1];
  const variantId = `variant-${state.pathogen.variants.length + 1}`;
  const variantName = `${parent.name} ${String.fromCharCode(0x03b1 + state.pathogen.variants.length)}`;
  const newVariant = makeVariantStrain({
    id: variantId,
    name: variantName,
    parentStrain: parent,
    newMutationId: m.id,
    effect: variantStatsFromMutation(parent, m),
    spawnedDay: state.day,
  });

  const candidateCities = Object.values(state.cities).filter((c) => c.I > 0 || c.E > 0);
  candidateCities.sort((a, b) => b.I - a.I);
  const seedCount = Math.min(3, candidateCities.length);
  const nextCities = { ...state.cities };
  for (let i = 0; i < seedCount; i++) {
    const c = candidateCities[i];
    const seed = Math.min(50, Math.floor(c.S * 0.0005) + 20);
    const compartments = { ...c.strainState };
    const existing = compartments[variantId] ?? { E: 0, I: 0, R: 0 };
    compartments[variantId] = { ...existing, I: existing.I + seed };
    nextCities[c.id] = {
      ...c,
      S: Math.max(0, c.S - seed),
      I: c.I + seed,
      strainState: compartments,
    };
  }
  const evt: GameEvent = {
    day: state.day,
    text: `New variant emerged: ${variantName}`,
    kind: 'mutation',
  };
  return {
    ...state,
    pathogen: { ...state.pathogen, variants: [...state.pathogen.variants, newVariant] },
    cities: nextCities,
    events: [...state.events, evt],
  };
}

export function buyMutation(state: GameState, mutationId: string): GameState {
  const m = getMutationById(mutationId);
  if (!m) return state;
  if (state.pathogen.mutations.has(m.id)) return state;
  if (!canAfford(state, m)) return state;
  if (!prereqsMet(state.pathogen, m)) return state;
  if (!pathogenTypeAllowed(state.pathogen, m)) return state;
  const evt: GameEvent = {
    day: state.day,
    text: `Pathogen evolved: ${m.name}`,
    kind: 'mutation',
  };
  let next: GameState = {
    ...state,
    pathogen: applyMutationEffect(state.pathogen, m),
    dnaPoints: state.dnaPoints - m.cost,
    events: [...state.events, evt],
  };
  if (m.effect.cureStageRollback) {
    next = applyStageRollback(next, m.effect.cureStageRollback.stageId, m.effect.cureStageRollback.amount);
  }
  if (m.effect.spawnsStrain) {
    next = spawnVariantStrain(next, m);
  }
  return next;
}

export function pickAIMutation(p: Pathogen): Mutation | undefined {
  const available = MUTATIONS.filter(
    (m) =>
      !p.mutations.has(m.id) &&
      m.prereqs.every((id) => p.mutations.has(id)) &&
      (!m.pathogenTypeOnly || m.pathogenTypeOnly.includes(p.type)),
  );
  if (available.length === 0) return undefined;
  const transmissionMutations = available.filter((m) => m.category === 'transmission' || m.category === 'ability');
  const pool = transmissionMutations.length > 0 ? transmissionMutations : available;
  return pool[Math.floor(Math.random() * pool.length)];
}

export { ORIGIN_STRAIN_ID };
