import type { City, GameState, InterventionId, StrainCompartment } from './types';
import { CURE_STAGE_ORDER } from './cure';

export const VACCINE_PHASE1_S_TO_R = 0.0005;
export const VACCINE_PHASE2_S_TO_R = 0.0018;
export const ANTIVIRAL_DURATION_DAYS = 90;
export const SCHOOL_CLOSURE_DURATION_DAYS = 60;
export const WHO_BUDGET_BONUS = 20;
export const WHO_STAGE_FUNDING_BONUS = 0.3;

const TIMED_GLOBAL: Record<string, number> = {
  'antiviral-stockpile': ANTIVIRAL_DURATION_DAYS,
};
const TIMED_CITY: Record<string, number> = {
  'school-closure': SCHOOL_CLOSURE_DURATION_DAYS,
};

export function setInterventionExpiry(
  state: GameState,
  scope: 'global' | 'city',
  id: InterventionId,
  cityId: string | null,
): GameState {
  if (scope === 'global') {
    const days = TIMED_GLOBAL[id];
    if (!days) return state;
    return {
      ...state,
      globalInterventionExpiry: {
        ...state.globalInterventionExpiry,
        [id]: state.day + days,
      },
    };
  }
  if (scope === 'city' && cityId) {
    const days = TIMED_CITY[id];
    if (!days) return state;
    const existing = state.cityInterventionExpiry[cityId] ?? {};
    return {
      ...state,
      cityInterventionExpiry: {
        ...state.cityInterventionExpiry,
        [cityId]: { ...existing, [id]: state.day + days },
      },
    };
  }
  return state;
}

export function applyExpiry(state: GameState): GameState {
  let changed = false;
  let next: GameState = state;

  const nextGlobal = { ...state.globalInterventionExpiry };
  const nextGlobalInterventions = new Set(state.globalInterventions);
  for (const [id, expireDay] of Object.entries(state.globalInterventionExpiry)) {
    if (state.day >= expireDay) {
      delete nextGlobal[id];
      nextGlobalInterventions.delete(id as InterventionId);
      changed = true;
    }
  }
  if (changed) {
    next = { ...next, globalInterventionExpiry: nextGlobal, globalInterventions: nextGlobalInterventions };
  }

  let cityChanged = false;
  const nextCities = { ...state.cities };
  const nextCityExpiry: Record<string, Record<string, number>> = {};
  for (const [cityId, expiries] of Object.entries(state.cityInterventionExpiry)) {
    const city = state.cities[cityId];
    if (!city) continue;
    const surviving: Record<string, number> = {};
    const interventions = new Set(city.interventions);
    let cityMutated = false;
    for (const [id, expireDay] of Object.entries(expiries)) {
      if (state.day >= expireDay) {
        interventions.delete(id as InterventionId);
        cityMutated = true;
      } else {
        surviving[id] = expireDay;
      }
    }
    if (cityMutated) {
      nextCities[cityId] = { ...city, interventions };
      cityChanged = true;
    }
    if (Object.keys(surviving).length > 0) {
      nextCityExpiry[cityId] = surviving;
    }
  }
  if (cityChanged) {
    next = { ...next, cities: nextCities, cityInterventionExpiry: nextCityExpiry };
  } else if (Object.keys(nextCityExpiry).length !== Object.keys(state.cityInterventionExpiry).length) {
    next = { ...next, cityInterventionExpiry: nextCityExpiry };
  }
  return next;
}

export function applyVaccineRollout(state: GameState): GameState {
  if (!state.globalInterventions.has('vaccine-rollout-1')) return state;
  const phase2 = state.globalInterventions.has('vaccine-rollout-2');
  const rate = phase2 ? VACCINE_PHASE2_S_TO_R : VACCINE_PHASE1_S_TO_R;
  const distribution = state.cure.stages.distribution.progress;
  if (!phase2 && distribution < 0.3) return state;
  const nextCities = { ...state.cities };
  for (const id of Object.keys(state.cities)) {
    const c = state.cities[id];
    if (c.S <= 0) continue;
    const move = c.S * rate;
    if (move <= 0) continue;
    const originComp: StrainCompartment = c.strainState.origin ?? { E: 0, I: 0, R: 0 };
    nextCities[id] = {
      ...c,
      S: Math.max(0, c.S - move),
      R: c.R + move,
      strainState: { ...c.strainState, origin: { ...originComp, R: originComp.R + move } },
    };
  }
  return { ...state, cities: nextCities };
}

export function applyWhoEmergencyFunding(state: GameState): GameState {
  const stages = { ...state.cure.stages };
  for (const id of CURE_STAGE_ORDER) {
    stages[id] = { ...stages[id], funding: stages[id].funding + WHO_STAGE_FUNDING_BONUS };
  }
  return {
    ...state,
    budget: state.budget + WHO_BUDGET_BONUS,
    cure: { ...state.cure, stages },
  };
}

export function isAntiviralActive(state: GameState): boolean {
  return state.globalInterventions.has('antiviral-stockpile');
}

export function vaccineRolloutPrereqMet(state: GameState, id: 'vaccine-rollout-1' | 'vaccine-rollout-2'): boolean {
  if (id === 'vaccine-rollout-1') return state.cure.stages.distribution.progress >= 0.3;
  return state.globalInterventions.has('vaccine-rollout-1');
}

export function contactTracingAllowed(city: City): boolean {
  return city.wealth >= 2;
}
