import type { Mutation, Pathogen, GameState, GameEvent } from './types';
import { MUTATIONS } from '../data/mutations';

export function getMutationById(id: string): Mutation | undefined {
  return MUTATIONS.find((m) => m.id === id);
}

export function applyMutationEffect(p: Pathogen, m: Mutation): Pathogen {
  const next: Pathogen = {
    ...p,
    mutations: new Set(p.mutations),
    climateTolerance: { ...p.climateTolerance },
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

export function prereqsMet(p: Pathogen, m: Mutation): boolean {
  return m.prereqs.every((id) => p.mutations.has(id));
}

export function buyMutation(state: GameState, mutationId: string): GameState {
  const m = getMutationById(mutationId);
  if (!m) return state;
  if (state.pathogen.mutations.has(m.id)) return state;
  if (!canAfford(state, m)) return state;
  if (!prereqsMet(state.pathogen, m)) return state;
  const evt: GameEvent = {
    day: state.day,
    text: `Pathogen evolved: ${m.name}`,
    kind: 'mutation',
  };
  return {
    ...state,
    pathogen: applyMutationEffect(state.pathogen, m),
    dnaPoints: state.dnaPoints - m.cost,
    events: [...state.events, evt],
  };
}

export function pickAIMutation(p: Pathogen): Mutation | undefined {
  const available = MUTATIONS.filter(
    (m) => !p.mutations.has(m.id) && m.prereqs.every((id) => p.mutations.has(id)),
  );
  if (available.length === 0) return undefined;
  const transmissionMutations = available.filter((m) => m.category === 'transmission' || m.category === 'ability');
  const pool = transmissionMutations.length > 0 ? transmissionMutations : available;
  return pool[Math.floor(Math.random() * pool.length)];
}
