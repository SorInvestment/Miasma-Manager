import type {
  Difficulty,
  GameMode,
  InterventionId,
  Pathogen,
  PathogenType,
  WinCondition,
} from './types';

export interface ScenarioModifiers {
  startCities?: string[];
  pathogenOverrides?: Partial<Pathogen>;
  startDay?: number;
  preInfected?: number;
  preRecovered?: number;
  preDeadRatio?: number;
  budgetMultiplier?: number;
  dnaMultiplier?: number;
  cureRateMultiplier?: number;
  deathLimitRatio?: number;
  unlockedInterventions?: InterventionId[];
  preActiveGlobalInterventions?: InterventionId[];
  winCondition?: WinCondition;
  winThreshold?: number;
  preCureStageProgress?: { stageId: 'sequencing' | 'vaccine-rd' | 'trials' | 'distribution'; progress: number }[];
  startCompliance?: number;
  healthcareOverloadMultiplier?: number;
}

export interface Scenario {
  id: string;
  side: GameMode;
  name: string;
  blurb: string;
  recommendedDifficulty: Difficulty;
  pathogenType: PathogenType;
  modifiers: ScenarioModifiers;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'sandbox-pathogen',
    side: 'pathogen',
    name: 'Patient Zero',
    blurb: 'Sandbox. Pick your start, evolve, and win.',
    recommendedDifficulty: 'normal',
    pathogenType: 'virus',
    modifiers: {},
  },
  {
    id: 'arctic-pole',
    side: 'pathogen',
    name: 'Cold Snap',
    blurb: 'Reykjavik origin. Climate hostile to spread. Win by 50% dead in 400 days.',
    recommendedDifficulty: 'hard',
    pathogenType: 'bacteria',
    modifiers: {
      startCities: ['rey'],
      pathogenOverrides: {
        climateTolerance: { arctic: 1.0, temperate: 0.55, tropical: 0.4, arid: 0.5 },
      },
      winCondition: 'kill-percent',
      winThreshold: 0.5,
    },
  },
  {
    id: 'bioterror-strike',
    side: 'pathogen',
    name: '5-City Strike',
    blurb: 'Engineered bioweapon seeded in 5 megacities. Race the cure to 70% dead.',
    recommendedDifficulty: 'normal',
    pathogenType: 'bioweapon',
    modifiers: {
      startCities: ['nyc', 'lon', 'tok', 'mum', 'sao'],
      cureRateMultiplier: 1.5,
      dnaMultiplier: 1.8,
      winCondition: 'kill-percent',
      winThreshold: 0.7,
    },
  },
  {
    id: 'vaccine-resistance-run',
    side: 'pathogen',
    name: 'Phase II',
    blurb: 'Game starts day 60. Vaccine rollout already global. Break through immune escape.',
    recommendedDifficulty: 'brutal',
    pathogenType: 'virus',
    modifiers: {
      startCities: ['mum', 'lag'],
      startDay: 60,
      preRecovered: 0.18,
      preActiveGlobalInterventions: ['public-info'],
      preCureStageProgress: [
        { stageId: 'sequencing', progress: 1 },
        { stageId: 'vaccine-rd', progress: 0.6 },
      ],
      winCondition: 'kill-percent',
      winThreshold: 0.35,
    },
  },
  {
    id: 'sandbox-defender',
    side: 'defender',
    name: 'Sandbox',
    blurb: 'Standard playthrough. Cure or contain before the death limit.',
    recommendedDifficulty: 'normal',
    pathogenType: 'virus',
    modifiers: {},
  },
  {
    id: 'who-emergency',
    side: 'defender',
    name: 'Slow Burn',
    blurb: 'Hidden prion-type pathogen. Cure to 100% before 4% mortality.',
    recommendedDifficulty: 'hard',
    pathogenType: 'prion',
    modifiers: {
      budgetMultiplier: 1.5,
      deathLimitRatio: 0.04,
      winCondition: 'standard',
    },
  },
  {
    id: 'quarantine-island',
    side: 'defender',
    name: 'Hold the Line',
    blurb: 'Bioweapon in Hong Kong. Contain the spread for 180 days.',
    recommendedDifficulty: 'hard',
    pathogenType: 'bioweapon',
    modifiers: {
      startCities: ['hkg'],
      unlockedInterventions: ['lockdown', 'travel-ban-air', 'travel-ban-sea', 'travel-ban-land', 'healthcare-surge'],
      winCondition: 'contain-spread',
      winThreshold: 180,
    },
  },
  {
    id: 'mass-casualty',
    side: 'defender',
    name: 'After the Fall',
    blurb: 'Day 90. 8% dead. Healthcare collapsed. Stabilize for 60 days.',
    recommendedDifficulty: 'brutal',
    pathogenType: 'virus',
    modifiers: {
      startDay: 90,
      preDeadRatio: 0.08,
      preInfected: 0.05,
      deathLimitRatio: 0.16,
      healthcareOverloadMultiplier: 1.5,
      startCompliance: 0.35,
      winCondition: 'time-survive',
      winThreshold: 60,
    },
  },
];

export const SCENARIO_INDEX: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);

export function defaultScenarioFor(side: GameMode): Scenario {
  return side === 'pathogen' ? SCENARIOS[0] : SCENARIOS[4];
}

export function scenariosForSide(side: GameMode): Scenario[] {
  return SCENARIOS.filter((s) => s.side === side);
}
