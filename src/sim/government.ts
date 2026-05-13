import type { City, GameState, GameEvent, InterventionId } from './types';
import {
  DETECTION_THRESHOLD,
  BASE_CURE_RATE,
  PASSIVE_CURE_RATE,
} from './constants';
import { adjustCompliance, LOCKDOWN_DEPLOY_PENALTY, PUBLIC_INFO_BONUS } from './compliance';
import { getMultipliers } from './difficulty';

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

export function progressCure(state: GameState): GameState {
  if (state.cureProgress >= 1) return state;
  if (!anyDetected(state)) return state;
  const wealthSum = Object.values(state.cities).reduce(
    (acc, c) => (c.detected ? acc + c.wealth * (c.S / c.population) : acc),
    0,
  );
  const passive = PASSIVE_CURE_RATE * wealthSum;
  const funded = state.mode === 'defender' ? BASE_CURE_RATE * state.cureFundingLevel * wealthSum : 0;
  const autoFunded = state.mode === 'pathogen' ? BASE_CURE_RATE * wealthSum * 0.7 : 0;
  const drugRes = 1 + state.pathogen.drugResistance;
  const mults = getMultipliers(state.difficulty);
  const delta = ((passive + funded + autoFunded) / drugRes) * mults.cureRate;
  const nextProgress = Math.min(1, state.cureProgress + delta);
  return { ...state, cureProgress: nextProgress };
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
    return next;
  }
  const city = state.cities[cityId];
  if (!city) return state;
  if (city.interventions.has(interventionId)) return state;
  const ints = new Set(city.interventions);
  ints.add(interventionId);
  let next: GameState = {
    ...state,
    budget: state.budget - effectiveCost,
    cities: { ...state.cities, [cityId]: { ...city, interventions: ints } },
    events: [...state.events, evt],
  };
  if (interventionId === 'lockdown') {
    next = adjustCompliance(next, -LOCKDOWN_DEPLOY_PENALTY);
  }
  return next;
}

export function fundResearch(state: GameState, amount: number): GameState {
  if (state.budget < amount) return state;
  return {
    ...state,
    budget: state.budget - amount,
    cureFundingLevel: state.cureFundingLevel + amount,
    events: [
      ...state.events,
      { day: state.day, text: `Funded cure research (+${amount})`, kind: 'cure' },
    ],
  };
}
