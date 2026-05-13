import type { City, GameState, GameEvent, HistoryPoint, InterventionId } from './types';
import { tickCity } from './seir';
import { computeTransfers, applyTransfers } from './transport';
import { updateDetection, aiPathogenModeInterventions } from './government';
import { progressCureStages } from './cure';
import { applyMutationEffect, pickAIMutation } from './mutation';
import { applyComplianceTickDelta, adjustCompliance } from './compliance';
import { MUTATIONS } from '../data/mutations';
import { getMultipliers } from './difficulty';
import { applyExpiry, applyVaccineRollout, isAntiviralActive } from './interventions';
import {
  DNA_PER_NEW_INFECTION,
  DNA_NEW_COUNTRY_BONUS,
  BUDGET_PER_DAY_BASE,
  BUDGET_PER_HEALTHY_BILLION,
  PATHOGEN_AI_MUTATE_INTERVAL,
  DEFENDER_DEATH_LIMIT_RATIO,
} from './constants';

function globalTotals(cities: Record<string, City>) {
  let S = 0, E = 0, I = 0, R = 0, D = 0;
  for (const c of Object.values(cities)) {
    S += c.S; E += c.E; I += c.I; R += c.R; D += c.D;
  }
  return { S, E, I, R, D };
}

function newInfectionsThisTick(prev: Record<string, City>, next: Record<string, City>): number {
  let total = 0;
  for (const id of Object.keys(prev)) {
    const before = prev[id];
    const after = next[id];
    if (!after) continue;
    const delta = Math.max(0, (after.E + after.I + after.R + after.D) - (before.E + before.I + before.R + before.D));
    total += delta;
  }
  return total;
}

function newDeathsThisTick(prev: Record<string, City>, next: Record<string, City>): number {
  let total = 0;
  for (const id of Object.keys(prev)) {
    const before = prev[id];
    const after = next[id];
    if (!after) continue;
    total += Math.max(0, after.D - before.D);
  }
  return total;
}

export function tick(state: GameState): GameState {
  if (state.phase !== 'playing') return state;

  const stateAfterExpiry = applyExpiry(state);

  let nextCities: Record<string, City> = {};
  const publicInfoActive = stateAfterExpiry.globalInterventions.has('public-info');
  const antiviralActive = isAntiviralActive(stateAfterExpiry);
  const seirMods = {
    publicInfoActive,
    compliance: stateAfterExpiry.compliance,
    globalInterventions: stateAfterExpiry.globalInterventions,
    antiviralActive,
  };
  for (const city of Object.values(stateAfterExpiry.cities)) {
    nextCities[city.id] = tickCity(city, stateAfterExpiry.pathogen, seirMods);
  }

  const globalTravelBans = new Set<InterventionId>();
  const transfers = computeTransfers(nextCities, globalTravelBans);
  nextCities = applyTransfers(nextCities, transfers);

  let nextState: GameState = { ...stateAfterExpiry, cities: nextCities };
  nextState = applyVaccineRollout(nextState);

  const detectionResult = updateDetection(nextState);
  nextState = detectionResult.state;

  nextState = aiPathogenModeInterventions(nextState);
  nextState = progressCureStages(nextState);
  nextState = applyComplianceTickDelta(nextState);

  let complianceDelta = 0;
  for (const m of MUTATIONS) {
    if (!nextState.pathogen.mutations.has(m.id)) continue;
    if (m.effect.complianceDelta) complianceDelta += m.effect.complianceDelta;
  }
  if (complianceDelta !== 0) {
    nextState = adjustCompliance(nextState, complianceDelta);
  }

  const newInfections = newInfectionsThisTick(state.cities, nextState.cities);
  const newDeaths = newDeathsThisTick(state.cities, nextState.cities);

  const totals = globalTotals(nextState.cities);
  const point: HistoryPoint = {
    day: state.day + 1,
    S: totals.S,
    E: totals.E,
    I: totals.I,
    R: totals.R,
    D: totals.D,
    cure: nextState.cureProgress,
  };

  let dnaPoints = nextState.dnaPoints;
  let budget = nextState.budget;
  const eventsToAdd: GameEvent[] = [];
  if (nextState.mode === 'pathogen') {
    dnaPoints += newInfections * DNA_PER_NEW_INFECTION;
    if (detectionResult.newDetections.length > 0) {
      const newCountries = new Set<string>();
      for (const id of detectionResult.newDetections) {
        const country = nextState.cities[id].country;
        const alreadyDetectedElsewhere = Object.values(state.cities).some(
          (c) => c.country === country && c.detected,
        );
        if (!alreadyDetectedElsewhere) newCountries.add(country);
      }
      dnaPoints += newCountries.size * DNA_NEW_COUNTRY_BONUS;
    }
  } else {
    const healthyBillions = totals.S / 1_000_000_000;
    budget += BUDGET_PER_DAY_BASE + BUDGET_PER_HEALTHY_BILLION * healthyBillions;
  }

  const diffMults = getMultipliers(nextState.difficulty);
  const aiMutateInterval = Math.max(4, Math.round(PATHOGEN_AI_MUTATE_INTERVAL * diffMults.aiMutate));
  if (nextState.mode === 'defender' && (state.day + 1) % aiMutateInterval === 0) {
    const m = pickAIMutation(nextState.pathogen);
    if (m) {
      nextState.pathogen = applyMutationEffect(nextState.pathogen, m);
      eventsToAdd.push({
        day: state.day + 1,
        text: `Pathogen mutated naturally: ${m.name}`,
        kind: 'mutation',
      });
    }
  }

  const initial = state.initialPopulation;
  const deadRatio = totals.D / initial;
  const livingInfected = totals.E + totals.I;
  const burnedOut = livingInfected < 1 && state.day > 30;

  let countriesInfected = 0;
  const seenCountries = new Set<string>();
  for (const c of Object.values(nextState.cities)) {
    if (c.I > 0 || c.E > 0) {
      if (!seenCountries.has(c.country)) {
        seenCountries.add(c.country);
        countriesInfected++;
      }
    }
  }

  let containedDays = nextState.containedDays;
  if (nextState.winCondition === 'contain-spread') {
    containedDays = countriesInfected < 5 ? containedDays + 1 : 0;
  } else if (nextState.winCondition === 'time-survive') {
    containedDays += 1;
  }

  const deathLimit = nextState.scenarioDeathLimit > 0 ? nextState.scenarioDeathLimit : DEFENDER_DEATH_LIMIT_RATIO;
  const newDay = state.day + 1;

  let phase = nextState.phase;
  if (nextState.mode === 'pathogen') {
    if (nextState.cureProgress >= 1) {
      phase = 'lost';
    } else if (nextState.winCondition === 'kill-percent') {
      if (deadRatio >= nextState.winThreshold) phase = 'won';
      else if (burnedOut) phase = 'lost';
    } else {
      if (deadRatio >= 0.65) phase = 'won';
      else if (burnedOut) phase = deadRatio > 0.45 ? 'won' : 'lost';
    }
  } else {
    if (deadRatio >= deathLimit) {
      phase = 'lost';
    } else if (nextState.winCondition === 'contain-spread') {
      if (containedDays >= nextState.winThreshold) phase = 'won';
    } else if (nextState.winCondition === 'time-survive') {
      if (containedDays >= nextState.winThreshold) phase = 'won';
    } else {
      if (nextState.cureProgress >= 1) phase = 'won';
      else if (burnedOut) phase = 'won';
    }
  }

  return {
    ...nextState,
    day: newDay,
    dnaPoints,
    budget,
    history: [...nextState.history, point],
    events: [...nextState.events, ...eventsToAdd],
    phase,
    containedDays,
  };
}
