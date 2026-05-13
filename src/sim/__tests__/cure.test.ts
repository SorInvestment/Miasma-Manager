import { describe, it, expect } from 'vitest';
import {
  CURE_STAGE_ORDER,
  applyStageRollback,
  deriveActiveStageId,
  deriveOverall,
  fundStage,
  makeInitialCureState,
  progressCureStages,
} from '../cure';
import type { City, GameState, Pathogen } from '../types';

const pathogen: Pathogen = {
  name: 'X', type: 'virus',
  transmissibility: 0.5,
  incubation: 4, infectiousPeriod: 7,
  lethality: 0.05, severity: 0.5,
  climateTolerance: { arctic: 0.5, temperate: 1, tropical: 1, arid: 0.9 },
  drugResistance: 0,
  mutations: new Set(),
};

function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'c1', name: 'C1', country: 'X', countryCode: 'X',
    lat: 0, lng: 0, population: 1_000_000,
    S: 950_000, E: 0, I: 50_000, R: 0, D: 0,
    climate: 'temperate', wealth: 3,
    ports: { air: [], sea: [], land: [] },
    detected: true, interventions: new Set(),
    healthcareCapacity: 0.018, healthcareLoad: 0,
    ...overrides,
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    mode: 'defender', day: 0, speed: 1,
    cities: { a: makeCity() },
    pathogen,
    dnaPoints: 0, budget: 200, cureProgress: 0, cureFundingLevel: 0,
    cure: makeInitialCureState(),
    events: [], phase: 'playing', selectedCityId: null,
    history: [], initialPopulation: 1_000_000, autoPauseTriggers: new Set(),
    compliance: 0.85, globalInterventions: new Set(),
    difficulty: 'normal',
    scenarioId: 'sandbox-defender',
    winCondition: 'standard',
    winThreshold: 0,
    lockedInterventions: new Set(),
    containedDays: 0,
    scenarioCureMultiplier: 1,
    scenarioDeathLimit: 0,
    ...overrides,
  };
}

describe('cure', () => {
  it('initial state has only sequencing unlocked', () => {
    const cure = makeInitialCureState();
    expect(cure.stages.sequencing.unlocked).toBe(true);
    expect(cure.stages['vaccine-rd'].unlocked).toBe(false);
    expect(cure.stages.trials.unlocked).toBe(false);
    expect(cure.stages.distribution.unlocked).toBe(false);
    expect(cure.overall).toBe(0);
  });

  it('deriveOverall returns mean of stage progresses', () => {
    const cure = makeInitialCureState();
    cure.stages.sequencing.progress = 1;
    cure.stages['vaccine-rd'].progress = 0.5;
    const overall = deriveOverall(cure);
    expect(overall).toBeCloseTo((1 + 0.5 + 0 + 0) / 4, 4);
  });

  it('deriveActiveStageId returns first incomplete stage', () => {
    const cure = makeInitialCureState();
    expect(deriveActiveStageId(cure)).toBe('sequencing');
    cure.stages.sequencing.progress = 1;
    expect(deriveActiveStageId(cure)).toBe('vaccine-rd');
  });

  it('progressCureStages advances sequencing first', () => {
    const state = makeState();
    const next = progressCureStages(state);
    expect(next.cure.stages.sequencing.progress).toBeGreaterThan(0);
    expect(next.cure.stages['vaccine-rd'].progress).toBe(0);
  });

  it('vaccine-rd unlocks when sequencing completes, advances on the next tick', () => {
    const state = makeState();
    state.cure.stages.sequencing.progress = 1;
    const t1 = progressCureStages(state);
    expect(t1.cure.stages['vaccine-rd'].unlocked).toBe(true);
    const t2 = progressCureStages(t1);
    expect(t2.cure.stages['vaccine-rd'].progress).toBeGreaterThan(0);
  });

  it('fundStage subtracts budget and raises stage funding', () => {
    const state = makeState();
    const next = fundStage(state, 'sequencing', 20);
    expect(next.budget).toBe(180);
    expect(next.cure.stages.sequencing.funding).toBe(20);
  });

  it('fundStage refuses if stage locked', () => {
    const state = makeState();
    const next = fundStage(state, 'trials', 20);
    expect(next).toBe(state);
  });

  it('cureProgress reflects cure.overall after progressCureStages', () => {
    const state = makeState();
    const next = progressCureStages(state);
    expect(next.cureProgress).toBeCloseTo(next.cure.overall, 6);
  });

  it('applyStageRollback subtracts progress from a stage', () => {
    const state = makeState();
    state.cure.stages.sequencing.progress = 0.8;
    const next = applyStageRollback(state, 'sequencing', 0.3);
    expect(next.cure.stages.sequencing.progress).toBeCloseTo(0.5, 4);
  });

  it('progressCureStages does not advance without detection', () => {
    const state = makeState({ cities: { a: makeCity({ detected: false }) } });
    const next = progressCureStages(state);
    expect(next.cure.stages.sequencing.progress).toBe(0);
  });

  it('CURE_STAGE_ORDER has 4 stages', () => {
    expect(CURE_STAGE_ORDER).toHaveLength(4);
  });
});
