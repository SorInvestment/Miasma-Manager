import { create } from 'zustand';
import type { GameState, GameMode, PathogenType, Pathogen, Speed, InterventionId } from '../sim/types';
import { makeCitiesIndex, totalWorldPopulation } from '../data/cities';
import { tick } from '../sim/engine';
import { buyMutation } from '../sim/mutation';
import { deployIntervention } from '../sim/government';
import { fundResearch, fundStage, makeInitialCureState } from '../sim/cure';
import { INTERVENTION_INDEX } from '../data/interventions';
import { COMPLIANCE_INITIAL } from '../sim/compliance';
import { getMultipliers } from '../sim/difficulty';
import { SCENARIO_INDEX, defaultScenarioFor, type Scenario } from '../sim/scenarios';
import type { CureStageId, Difficulty, WinCondition } from '../sim/types';

const PATHOGEN_PRESETS: Record<PathogenType, Pathogen> = {
  virus: {
    name: 'Virus', type: 'virus',
    transmissibility: 0.45, incubation: 4, infectiousPeriod: 7,
    lethality: 0.02, severity: 0.5,
    climateTolerance: { arctic: 0.6, temperate: 1.0, tropical: 1.0, arid: 0.9 },
    drugResistance: 0,
    mutations: new Set(), variants: [],
  },
  bacteria: {
    name: 'Bacteria', type: 'bacteria',
    transmissibility: 0.35, incubation: 3, infectiousPeriod: 12,
    lethality: 0.04, severity: 0.6,
    climateTolerance: { arctic: 0.5, temperate: 0.9, tropical: 1.0, arid: 0.95 },
    drugResistance: 0.2,
    mutations: new Set(), variants: [],
  },
  fungus: {
    name: 'Fungus', type: 'fungus',
    transmissibility: 0.25, incubation: 6, infectiousPeriod: 18,
    lethality: 0.03, severity: 0.3,
    climateTolerance: { arctic: 0.3, temperate: 0.7, tropical: 1.0, arid: 0.6 },
    drugResistance: 0.4,
    mutations: new Set(), variants: [],
  },
  parasite: {
    name: 'Parasite', type: 'parasite',
    transmissibility: 0.30, incubation: 8, infectiousPeriod: 22,
    lethality: 0.025, severity: 0.4,
    climateTolerance: { arctic: 0.2, temperate: 0.7, tropical: 1.0, arid: 0.8 },
    drugResistance: 0.3,
    mutations: new Set(), variants: [],
  },
  prion: {
    name: 'Prion', type: 'prion',
    transmissibility: 0.18, incubation: 30, infectiousPeriod: 60,
    lethality: 0.95, severity: 0.55,
    climateTolerance: { arctic: 1.0, temperate: 1.0, tropical: 1.0, arid: 1.0 },
    drugResistance: 1.5,
    mutations: new Set(), variants: [],
  },
  bioweapon: {
    name: 'Bioweapon', type: 'bioweapon',
    transmissibility: 0.65, incubation: 2, infectiousPeriod: 5,
    lethality: 0.12, severity: 0.85,
    climateTolerance: { arctic: 0.95, temperate: 1.0, tropical: 1.0, arid: 0.95 },
    drugResistance: 0.6,
    mutations: new Set(), variants: [],
  },
};

interface StartGameOpts {
  mode: GameMode;
  pathogenType: PathogenType;
  startCityId: string;
  pathogenName?: string;
  difficulty?: Difficulty;
  scenarioId?: string;
}

interface StoreActions {
  startGame: (
    modeOrOpts: GameMode | StartGameOpts,
    pathogenType?: PathogenType,
    startCityId?: string,
    pathogenName?: string,
  ) => void;
  setSpeed: (s: Speed) => void;
  togglePause: () => void;
  tickOnce: () => void;
  selectCity: (id: string | null) => void;
  buyMutationAction: (mutationId: string) => void;
  deployInterventionAction: (interventionId: InterventionId, cityId: string | null) => void;
  fundResearchAction: (amount: number) => void;
  fundStageAction: (stageId: CureStageId, amount: number) => void;
  resetGame: () => void;
  clearAutoPause: (key: string) => void;
  setDifficulty: (d: Difficulty) => void;
}

export type GameStore = GameState & StoreActions;

const initialState: GameState = {
  mode: 'pathogen',
  day: 0,
  speed: 0,
  cities: makeCitiesIndex(),
  pathogen: PATHOGEN_PRESETS.virus,
  dnaPoints: 4,
  budget: 10,
  cureProgress: 0,
  cureFundingLevel: 0,
  cure: makeInitialCureState(),
  events: [],
  phase: 'start',
  selectedCityId: null,
  history: [],
  initialPopulation: totalWorldPopulation(),
  autoPauseTriggers: new Set(),
  compliance: COMPLIANCE_INITIAL,
  globalInterventions: new Set(),
  difficulty: 'normal',
  scenarioId: 'sandbox-pathogen',
  winCondition: 'standard',
  winThreshold: 0,
  lockedInterventions: new Set(),
  containedDays: 0,
  scenarioCureMultiplier: 1,
  scenarioDeathLimit: 0,
  globalInterventionExpiry: {},
  cityInterventionExpiry: {},
};

function checkAutoPause(prev: GameState, next: GameState): { triggers: string[]; nextTriggers: Set<string> } {
  const triggers: string[] = [];
  const fired = new Set(prev.autoPauseTriggers);
  const newDetections = Object.values(next.cities).filter(
    (c) => c.detected && !prev.cities[c.id]?.detected,
  );
  if (newDetections.length > 0 && !fired.has('first-detection')) {
    fired.add('first-detection');
    triggers.push('first-detection');
  }
  for (const t of [0.25, 0.5, 0.75]) {
    const key = `cure-${t}`;
    if (next.cureProgress >= t && prev.cureProgress < t && !fired.has(key)) {
      fired.add(key);
      triggers.push(key);
    }
  }
  return { triggers, nextTriggers: fired };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: (modeOrOpts, pathogenType, startCityId, pathogenName) => {
    const opts: StartGameOpts =
      typeof modeOrOpts === 'string'
        ? {
            mode: modeOrOpts,
            pathogenType: pathogenType as PathogenType,
            startCityId: startCityId as string,
            pathogenName,
          }
        : modeOrOpts;
    const difficulty: Difficulty = opts.difficulty ?? get().difficulty ?? 'normal';
    const mults = getMultipliers(difficulty);

    const scenario: Scenario = opts.scenarioId
      ? SCENARIO_INDEX[opts.scenarioId] ?? defaultScenarioFor(opts.mode)
      : defaultScenarioFor(opts.mode);
    const mods = scenario.modifiers;

    const cities = makeCitiesIndex();
    const seedCities = mods.startCities && mods.startCities.length > 0
      ? mods.startCities
      : [opts.startCityId];

    for (const cid of seedCities) {
      const c = cities[cid];
      if (!c) continue;
      const seed = Math.min(50, c.S);
      const originComp = c.strainState.origin ?? { E: 0, I: 0, R: 0 };
      cities[cid] = {
        ...c,
        S: c.S - seed,
        I: c.I + seed,
        strainState: { ...c.strainState, origin: { ...originComp, I: originComp.I + seed } },
      };
    }

    if (mods.preDeadRatio) {
      for (const id of Object.keys(cities)) {
        const c = cities[id];
        const dead = Math.round(c.population * mods.preDeadRatio);
        cities[id] = { ...c, S: Math.max(0, c.S - dead), D: c.D + dead };
      }
    }
    if (mods.preInfected) {
      for (const id of Object.keys(cities)) {
        const c = cities[id];
        const infected = Math.round(c.S * mods.preInfected);
        const originComp = c.strainState.origin ?? { E: 0, I: 0, R: 0 };
        cities[id] = {
          ...c,
          S: c.S - infected,
          I: c.I + infected,
          detected: true,
          strainState: { ...c.strainState, origin: { ...originComp, I: originComp.I + infected } },
        };
      }
    }
    if (mods.preRecovered) {
      for (const id of Object.keys(cities)) {
        const c = cities[id];
        const recovered = Math.round(c.S * mods.preRecovered);
        const originComp = c.strainState.origin ?? { E: 0, I: 0, R: 0 };
        cities[id] = {
          ...c,
          S: c.S - recovered,
          R: c.R + recovered,
          strainState: { ...c.strainState, origin: { ...originComp, R: originComp.R + recovered } },
        };
      }
    }
    if (mods.healthcareOverloadMultiplier) {
      for (const id of Object.keys(cities)) {
        const c = cities[id];
        cities[id] = { ...c, healthcareLoad: c.healthcareCapacity * mods.healthcareOverloadMultiplier };
      }
    }

    const preset = PATHOGEN_PRESETS[opts.pathogenType];
    const pathogen: Pathogen = {
      ...preset,
      name: opts.pathogenName?.trim() || preset.name,
      climateTolerance: { ...preset.climateTolerance },
      mutations: new Set(), variants: [],
      ...(mods.pathogenOverrides ?? {}),
    };
    if (mods.pathogenOverrides?.climateTolerance) {
      pathogen.climateTolerance = { ...pathogen.climateTolerance, ...mods.pathogenOverrides.climateTolerance };
    }

    const baseBudget = opts.mode === 'defender' ? Math.round(10 * mults.startResources) : 0;
    const budget = mods.budgetMultiplier ? Math.round(baseBudget * mods.budgetMultiplier) : baseBudget;
    const baseDna = opts.mode === 'pathogen' ? Math.round(4 * mults.startResources) : 0;
    const dnaPoints = mods.dnaMultiplier ? Math.round(baseDna * mods.dnaMultiplier) : baseDna;

    const cure = makeInitialCureState();
    if (mods.preCureStageProgress) {
      for (const { stageId, progress } of mods.preCureStageProgress) {
        cure.stages[stageId].progress = Math.min(1, Math.max(0, progress));
      }
      let unlock = true;
      for (const id of (['sequencing', 'vaccine-rd', 'trials', 'distribution'] as CureStageId[])) {
        cure.stages[id].unlocked = unlock;
        unlock = cure.stages[id].progress >= 1;
      }
      cure.overall = (cure.stages.sequencing.progress + cure.stages['vaccine-rd'].progress + cure.stages.trials.progress + cure.stages.distribution.progress) / 4;
      const order: CureStageId[] = ['sequencing', 'vaccine-rd', 'trials', 'distribution'];
      cure.activeStageId = order.find((id) => cure.stages[id].progress < 1) ?? 'distribution';
    }

    const lockedInterventions = new Set<InterventionId>();
    if (mods.unlockedInterventions) {
      const unlocked = new Set(mods.unlockedInterventions);
      for (const iv of Object.keys(INTERVENTION_INDEX) as InterventionId[]) {
        if (!unlocked.has(iv)) lockedInterventions.add(iv);
      }
    }

    const globalInterventions = new Set<InterventionId>(mods.preActiveGlobalInterventions ?? []);
    const compliance = mods.startCompliance ?? COMPLIANCE_INITIAL;

    const winCondition: WinCondition = mods.winCondition ?? 'standard';
    const winThreshold = mods.winThreshold ?? 0;

    const startCity = cities[seedCities[0]];

    set({
      mode: opts.mode,
      day: mods.startDay ?? 0,
      speed: 1,
      cities,
      pathogen,
      dnaPoints,
      budget,
      cureProgress: cure.overall,
      cureFundingLevel: 0,
      cure,
      events: [
        {
          day: mods.startDay ?? 0,
          text: seedCities.length > 1
            ? `Outbreak began in ${seedCities.length} cities`
            : `Outbreak began in ${startCity?.name ?? seedCities[0]}`,
          kind: 'system',
        },
      ],
      phase: 'playing',
      selectedCityId: seedCities[0],
      history: [],
      initialPopulation: totalWorldPopulation(),
      autoPauseTriggers: new Set(),
      compliance,
      globalInterventions,
      difficulty,
      scenarioId: scenario.id,
      winCondition,
      winThreshold,
      lockedInterventions,
      containedDays: 0,
      scenarioCureMultiplier: mods.cureRateMultiplier ?? 1,
      scenarioDeathLimit: mods.deathLimitRatio ?? 0,
      globalInterventionExpiry: {},
      cityInterventionExpiry: {},
    });
  },

  setSpeed: (s) => set({ speed: s }),
  togglePause: () => set((state) => ({ speed: state.speed === 0 ? 1 : 0 })),

  tickOnce: () => {
    const prev = get();
    if (prev.phase !== 'playing') return;
    const next = tick(prev);
    const { triggers, nextTriggers } = checkAutoPause(prev, next);
    set({
      ...next,
      autoPauseTriggers: nextTriggers,
      speed: triggers.length > 0 ? 0 : next.speed,
    });
  },

  selectCity: (id) => set({ selectedCityId: id }),

  buyMutationAction: (mutationId) => {
    const prev = get();
    const next = buyMutation(prev, mutationId);
    set(next);
  },

  deployInterventionAction: (interventionId, cityId) => {
    const prev = get();
    const intervention = INTERVENTION_INDEX[interventionId];
    if (!intervention) return;
    const next = deployIntervention(prev, interventionId, cityId, intervention.cost);
    set(next);
  },

  fundResearchAction: (amount) => {
    const prev = get();
    const next = fundResearch(prev, amount);
    set(next);
  },

  fundStageAction: (stageId, amount) => {
    const prev = get();
    const next = fundStage(prev, stageId, amount);
    set(next);
  },

  resetGame: () => set({ ...initialState, cities: makeCitiesIndex(), autoPauseTriggers: new Set(), globalInterventions: new Set(), lockedInterventions: new Set() }),

  clearAutoPause: (key) => set((state) => {
    const next = new Set(state.autoPauseTriggers);
    next.delete(key);
    return { autoPauseTriggers: next };
  }),

  setDifficulty: (d) => set({ difficulty: d }),
}));

export { PATHOGEN_PRESETS };
