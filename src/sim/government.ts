import type { City, GameState, GameEvent, InterventionId } from './types';
import { DETECTION_THRESHOLD } from './constants';
import { adjustCompliance, LOCKDOWN_DEPLOY_PENALTY, PUBLIC_INFO_BONUS } from './compliance';
import { getMultipliers } from './difficulty';
import {
  applyWhoEmergencyFunding,
  contactTracingAllowed,
  setInterventionExpiry,
  vaccineRolloutPrereqMet,
} from './interventions';
export { progressCure, fundResearch } from './cure';

export function updateDetection(state: GameState): { state: GameState; newDetections: string[] } {
  const newDetections: string[] = [];
  const nextCities: Record<string, City> = { ...state.cities };
  const mults = getMultipliers(state.difficulty);
  for (const city of Object.values(state.cities)) {
    if (city.detected) continue;
    const N = city.S + city.E + city.I + city.R;
    if (N <= 0) continue;
    const threshold = (DETECTION_THRESHOLD * (4 - city.wealth)) / Math.max(0.1, mults.detection);
    const severityBoost = Math.max(0.4, state.pathogen.severity);
    if (city.I / N > threshold / severityBoost) {
      nextCities[city.id] = { ...city, detected: true };
      newDetections.push(city.id);
    }
  }
  if (newDetections.length === 0) return { state, newDetections };
  const newEvents: GameEvent[] = newDetections.map((id) => ({
    day: state.day,
    text: `Pathogen detected in ${state.cities[id].name}, ${state.cities[id].country}`,
    kind: 'detection',
  }));
  return {
    state: { ...state, cities: nextCities, events: [...state.events, ...newEvents] },
    newDetections,
  };
}

export function anyDetected(state: GameState): boolean {
  for (const c of Object.values(state.cities)) if (c.detected) return true;
  return false;
}

export function aiPathogenModeInterventions(state: GameState): GameState {
  if (state.mode !== 'pathogen') return state;
  const nextCities: Record<string, City> = { ...state.cities };
  let changed = false;
  let newLockdowns = 0;
  for (const city of Object.values(state.cities)) {
    const N = city.S + city.E + city.I + city.R;
    if (N <= 0) continue;
    const infectionRatio = city.I / N;
    const ints = new Set(city.interventions);
    const before = ints.size;
    const hadLockdown = ints.has('lockdown');
    if (city.detected && infectionRatio > 0.03 && !ints.has('lockdown')) {
      ints.add('lockdown');
    }
    if (city.detected && infectionRatio > 0.05 && !ints.has('healthcare-surge')) {
      ints.add('healthcare-surge');
    }
    if (city.detected && infectionRatio > 0.02 && !ints.has('travel-ban-air')) {
      ints.add('travel-ban-air');
    }
    if (ints.size !== before) {
      nextCities[city.id] = { ...city, interventions: ints };
      changed = true;
      if (!hadLockdown && ints.has('lockdown')) newLockdowns++;
    }
  }
  if (!changed) return state;
  let next: GameState = { ...state, cities: nextCities };
  if (newLockdowns > 0) {
    next = adjustCompliance(next, -LOCKDOWN_DEPLOY_PENALTY * newLockdowns);
  }
  return next;
}

export function deployIntervention(state: GameState, interventionId: InterventionId, cityId: string | null, cost: number): GameState {
  if (state.lockedInterventions.has(interventionId)) return state;
  if (interventionId === 'vaccine-rollout-1' || interventionId === 'vaccine-rollout-2') {
    if (!vaccineRolloutPrereqMet(state, interventionId)) return state;
  }
  const mults = getMultipliers(state.difficulty);
  const effectiveCost = cost * mults.interventionCost;
  if (state.budget < effectiveCost) return state;
  const evt: GameEvent = {
    day: state.day,
    text: cityId
      ? `Deployed ${interventionId} in ${state.cities[cityId]?.name ?? cityId}`
      : `Deployed global ${interventionId}`,
    kind: 'intervention',
  };
  if (!cityId) {
    const globals = new Set(state.globalInterventions);
    if (globals.has(interventionId)) return state;
    globals.add(interventionId);
    let next: GameState = {
      ...state,
      budget: state.budget - effectiveCost,
      globalInterventions: globals,
      events: [...state.events, evt],
    };
    if (interventionId === 'public-info') {
      next = adjustCompliance(next, PUBLIC_INFO_BONUS);
    }
    if (interventionId === 'who-emergency-funding') {
      next = applyWhoEmergencyFunding(next);
    }
    next = setInterventionExpiry(next, 'global', interventionId, null);
    return next;
  }
  const city = state.cities[cityId];
  if (!city) return state;
  if (city.interventions.has(interventionId)) return state;
  if (interventionId === 'contact-tracing' && !contactTracingAllowed(city)) return state;
  const ints = new Set(city.interventions);
  ints.add(interventionId);
  let next: GameState = {
    ...state,
    budget: state.budget - effectiveCost,
    cities: { ...state.cities, [cityId]: { ...city, interventions: ints } },
    events: [...state.events, evt],
  };
  if (interventionId === 'lockdown' || interventionId === 'mask-mandate' || interventionId === 'school-closure') {
    next = adjustCompliance(next, -LOCKDOWN_DEPLOY_PENALTY);
  }
  next = setInterventionExpiry(next, 'city', interventionId, cityId);
  return next;
}

