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
import type { CureStageId, Difficulty } from '../sim/types';

const PATHOGEN_PRESETS: Record<PathogenType, Pathogen> = {
  virus: {
    name: 'Virus', type: 'virus',
    transmissibility: 0.45, incubation: 4, infectiousPeriod: 7,
    lethality: 0.02, severity: 0.5,
    climateTolerance: { arctic: 0.6, temperate: 1.0, tropical: 1.0, arid: 0.9 },
    drugResistance: 0,
    mutations: new Set(),
  },
  bacteria: {
    name: 'Bacteria', type: 'bacteria',
    transmissibility: 0.35, incubation: 3, infectiousPeriod: 12,
    lethality: 0.04, severity: 0.6,
    climateTolerance: { arctic: 0.5, temperate: 0.9, tropical: 1.0, arid: 0.95 },
    drugResistance: 0.2,
    mutations: new Set(),
  },
  fungus: {
    name: 'Fungus', type: 'fungus',
    transmissibility: 0.25, incubation: 6, infectiousPeriod: 18,
    lethality: 0.03, severity: 0.3,
    climateTolerance: { arctic: 0.3, temperate: 0.7, tropical: 1.0, arid: 0.6 },
    drugResistance: 0.4,
    mutations: new Set(),
  },
};

interface StartGameOpts {
  mode: GameMode;
  pathogenType: PathogenType;
  startCityId: string;
  pathogenName?: string;
  difficulty?: Difficulty;
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
    const cities = makeCitiesIndex();
    const startCity = cities[opts.startCityId];
    if (startCity) {
      const seed = Math.min(50, startCity.S);
      cities[opts.startCityId] = { ...startCity, S: startCity.S - seed, I: seed };
    }
    const preset = PATHOGEN_PRESETS[opts.pathogenType];
    const pathogen: Pathogen = {
      ...preset,
      name: opts.pathogenName?.trim() || preset.name,
      climateTolerance: { ...preset.climateTolerance },
      mutations: new Set(),
    };
    set({
      mode: opts.mode,
      day: 0,
      speed: 1,
      cities,
      pathogen,
      dnaPoints: opts.mode === 'pathogen' ? Math.round(4 * mults.startResources) : 0,
      budget: opts.mode === 'defender' ? Math.round(10 * mults.startResources) : 0,
      cureProgress: 0,
      cureFundingLevel: 0,
      cure: makeInitialCureState(),
      events: [
        {
          day: 0,
          text: `Outbreak began in ${startCity?.name ?? opts.startCityId}`,
          kind: 'system',
        },
      ],
      phase: 'playing',
      selectedCityId: opts.startCityId,
      history: [],
      initialPopulation: totalWorldPopulation(),
      autoPauseTriggers: new Set(),
      compliance: COMPLIANCE_INITIAL,
      globalInterventions: new Set(),
      difficulty,
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

  resetGame: () => set({ ...initialState, cities: makeCitiesIndex(), autoPauseTriggers: new Set(), globalInterventions: new Set() }),

  clearAutoPause: (key) => set((state) => {
    const next = new Set(state.autoPauseTriggers);
    next.delete(key);
    return { autoPauseTriggers: next };
  }),

  setDifficulty: (d) => set({ difficulty: d }),
}));

export { PATHOGEN_PRESETS };
