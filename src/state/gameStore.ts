import { create } from 'zustand';
import type { GameState, GameMode, PathogenType, Pathogen, Speed, InterventionId } from '../sim/types';
import { makeCitiesIndex, totalWorldPopulation } from '../data/cities';
import { tick } from '../sim/engine';
import { buyMutation } from '../sim/mutation';
import { deployIntervention, fundResearch } from '../sim/government';
import { INTERVENTION_INDEX } from '../data/interventions';

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

interface StoreActions {
  startGame: (mode: GameMode, pathogenType: PathogenType, startCityId: string, pathogenName?: string) => void;
  setSpeed: (s: Speed) => void;
  togglePause: () => void;
  tickOnce: () => void;
  selectCity: (id: string | null) => void;
  buyMutationAction: (mutationId: string) => void;
  deployInterventionAction: (interventionId: InterventionId, cityId: string | null) => void;
  fundResearchAction: (amount: number) => void;
  resetGame: () => void;
  clearAutoPause: (key: string) => void;
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
  events: [],
  phase: 'start',
  selectedCityId: null,
  history: [],
  initialPopulation: totalWorldPopulation(),
  autoPauseTriggers: new Set(),
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

  startGame: (mode, pathogenType, startCityId, pathogenName) => {
    const cities = makeCitiesIndex();
    const startCity = cities[startCityId];
    if (startCity) {
      const seed = Math.min(50, startCity.S);
      cities[startCityId] = { ...startCity, S: startCity.S - seed, I: seed };
    }
    const preset = PATHOGEN_PRESETS[pathogenType];
    const pathogen: Pathogen = {
      ...preset,
      name: pathogenName?.trim() || preset.name,
      climateTolerance: { ...preset.climateTolerance },
      mutations: new Set(),
    };
    set({
      mode,
      day: 0,
      speed: 1,
      cities,
      pathogen,
      dnaPoints: mode === 'pathogen' ? 4 : 0,
      budget: mode === 'defender' ? 10 : 0,
      cureProgress: 0,
      cureFundingLevel: 0,
      events: [
        {
          day: 0,
          text: `Outbreak began in ${startCity?.name ?? startCityId}`,
          kind: 'system',
        },
      ],
      phase: 'playing',
      selectedCityId: startCityId,
      history: [],
      initialPopulation: totalWorldPopulation(),
      autoPauseTriggers: new Set(),
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

  resetGame: () => set({ ...initialState, cities: makeCitiesIndex(), autoPauseTriggers: new Set() }),

  clearAutoPause: (key) => set((state) => {
    const next = new Set(state.autoPauseTriggers);
    next.delete(key);
    return { autoPauseTriggers: next };
  }),
}));

export { PATHOGEN_PRESETS };
