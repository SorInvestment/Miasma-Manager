import type { CureStage, CureStageId, CureState, GameState } from './types';
import { getMultipliers } from './difficulty';

export const CURE_STAGE_ORDER: CureStageId[] = [
  'sequencing',
  'vaccine-rd',
  'trials',
  'distribution',
];

export const CURE_STAGE_LABELS: Record<CureStageId, string> = {
  sequencing: 'Sequencing',
  'vaccine-rd': 'Vaccine R&D',
  trials: 'Clinical Trials',
  distribution: 'Distribution',
};

export const CURE_STAGE_BLURBS: Record<CureStageId, string> = {
  sequencing: 'Detect, sequence, and characterize the pathogen genome.',
  'vaccine-rd': 'Develop vaccine candidates in research labs.',
  trials: 'Run clinical trials to validate efficacy and safety.',
  distribution: 'Manufacture and distribute the approved vaccine.',
};

const STAGE_RATE = {
  sequencing: 0.00010,
  'vaccine-rd': 0.00006,
  trials: 0.00009,
  distribution: 0.00008,
} as const;

const FUNDING_DIVISORS = {
  sequencing: 30,
  'vaccine-rd': 40,
  trials: 25,
  distribution: 35,
} as const;

export function makeInitialCureState(): CureState {
  const blank: CureStage[] = CURE_STAGE_ORDER.map((id, idx) => ({
    id,
    progress: 0,
    funding: 0,
    unlocked: idx === 0,
  }));
  const stages = Object.fromEntries(blank.map((s) => [s.id, s])) as Record<CureStageId, CureStage>;
  return { stages, activeStageId: 'sequencing', overall: 0 };
}

export function deriveActiveStageId(cure: CureState): CureStageId {
  for (const id of CURE_STAGE_ORDER) {
    if (cure.stages[id].progress < 1) return id;
  }
  return 'distribution';
}

export function deriveOverall(cure: CureState): number {
  let sum = 0;
  for (const id of CURE_STAGE_ORDER) sum += cure.stages[id].progress;
  return sum / CURE_STAGE_ORDER.length;
}

function unlockedSnapshot(cure: CureState): CureState {
  let prevDone = true;
  const stages = { ...cure.stages } as Record<CureStageId, CureStage>;
  for (const id of CURE_STAGE_ORDER) {
    const s = stages[id];
    const shouldUnlock = prevDone;
    if (s.unlocked !== shouldUnlock) {
      stages[id] = { ...s, unlocked: shouldUnlock };
    }
    prevDone = stages[id].progress >= 1;
  }
  return { ...cure, stages };
}

export function progressCureStages(state: GameState): GameState {
  if (state.cure.overall >= 1) return syncCureProgress(state);
  let detectedCount = 0;
  let wealthSum = 0;
  let recovered = 0;
  let susceptible = 0;
  let totalPop = 0;
  for (const c of Object.values(state.cities)) {
    if (c.detected) {
      detectedCount += 1;
      wealthSum += c.wealth * (c.S / c.population);
    }
    recovered += c.R;
    susceptible += c.S;
    totalPop += c.population;
  }
  if (detectedCount === 0) return syncCureProgress(state);
  const drugRes = 1 + state.pathogen.drugResistance;
  const mults = getMultipliers(state.difficulty);
  const recoveredFraction = totalPop > 0 ? recovered / totalPop : 0;
  const susceptibleFraction = totalPop > 0 ? susceptible / totalPop : 0;

  const drivers: Record<CureStageId, number> = {
    sequencing: STAGE_RATE.sequencing * detectedCount,
    'vaccine-rd': STAGE_RATE['vaccine-rd'] * wealthSum,
    trials: STAGE_RATE.trials * recoveredFraction,
    distribution: STAGE_RATE.distribution * susceptibleFraction * wealthSum,
  };
  const drugDivisors: Record<CureStageId, number> = {
    sequencing: drugRes,
    'vaccine-rd': 1 + state.pathogen.drugResistance * 1.5,
    trials: 1,
    distribution: 1,
  };

  const autoFundingFactor = state.mode === 'pathogen' ? 0.7 : 1;
  const scenarioMult = state.scenarioCureMultiplier || 1;

  const nextStages = { ...state.cure.stages } as Record<CureStageId, CureStage>;
  for (const id of CURE_STAGE_ORDER) {
    const s = state.cure.stages[id];
    if (!s.unlocked || s.progress >= 1) continue;
    const fundingMod = 1 + s.funding / FUNDING_DIVISORS[id];
    const raw = (drivers[id] * fundingMod) / drugDivisors[id];
    const delta = raw * mults.cureRate * autoFundingFactor * scenarioMult;
    const nextProgress = Math.min(1, s.progress + delta);
    if (nextProgress !== s.progress) {
      nextStages[id] = { ...s, progress: nextProgress };
    }
  }
  const interim: CureState = unlockedSnapshot({
    stages: nextStages,
    activeStageId: state.cure.activeStageId,
    overall: state.cure.overall,
  });
  interim.activeStageId = deriveActiveStageId(interim);
  interim.overall = deriveOverall(interim);
  return syncCureProgress({ ...state, cure: interim });
}

export function fundStage(state: GameState, stageId: CureStageId, amount: number): GameState {
  if (state.budget < amount || amount <= 0) return state;
  const stage = state.cure.stages[stageId];
  if (!stage || !stage.unlocked || stage.progress >= 1) return state;
  const stages = { ...state.cure.stages, [stageId]: { ...stage, funding: stage.funding + amount } };
  const cure: CureState = { ...state.cure, stages };
  const cureFundingLevel = state.cureFundingLevel + amount;
  return {
    ...state,
    cure,
    cureFundingLevel,
    budget: state.budget - amount,
    events: [
      ...state.events,
      {
        day: state.day,
        text: `Funded ${CURE_STAGE_LABELS[stageId]} (+${amount})`,
        kind: 'cure',
      },
    ],
  };
}

export function syncCureProgress(state: GameState): GameState {
  if (state.cureProgress === state.cure.overall) return state;
  return { ...state, cureProgress: state.cure.overall };
}

export function progressCure(state: GameState): GameState {
  return progressCureStages(state);
}

export function fundResearch(state: GameState, amount: number): GameState {
  const activeId = deriveActiveStageId(state.cure);
  return fundStage(state, activeId, amount);
}

export function applyStageRollback(state: GameState, stageId: CureStageId, amount: number): GameState {
  const stage = state.cure.stages[stageId];
  if (!stage) return state;
  const next = Math.max(0, stage.progress - amount);
  if (next === stage.progress) return state;
  const stages = { ...state.cure.stages, [stageId]: { ...stage, progress: next } };
  const cure: CureState = unlockedSnapshot({
    stages,
    activeStageId: state.cure.activeStageId,
    overall: state.cure.overall,
  });
  cure.activeStageId = deriveActiveStageId(cure);
  cure.overall = deriveOverall(cure);
  return syncCureProgress({ ...state, cure });
}
