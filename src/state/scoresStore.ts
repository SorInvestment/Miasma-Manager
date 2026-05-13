import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty } from '../sim/types';

export interface ScenarioBest {
  scenarioId: string;
  difficulty: Difficulty;
  completedDay: number | null;
  killPercent: number;
  containedDays: number;
  attempts: number;
  wins: number;
}

interface ScoresState {
  bests: Record<string, ScenarioBest>;
  totalGames: number;
  totalWins: number;
  totalDeaths: number;
}

interface ScoresActions {
  recordRun: (params: {
    scenarioId: string;
    difficulty: Difficulty;
    won: boolean;
    completedDay: number;
    killPercent: number;
    containedDays: number;
    deaths: number;
  }) => void;
  resetScores: () => void;
}

const initial: ScoresState = {
  bests: {},
  totalGames: 0,
  totalWins: 0,
  totalDeaths: 0,
};

export const useScoresStore = create<ScoresState & ScoresActions>()(
  persist(
    (set) => ({
      ...initial,
      recordRun: ({ scenarioId, difficulty, won, completedDay, killPercent, containedDays, deaths }) =>
        set((state) => {
          const key = `${scenarioId}:${difficulty}`;
          const prev = state.bests[key] ?? {
            scenarioId,
            difficulty,
            completedDay: null,
            killPercent: 0,
            containedDays: 0,
            attempts: 0,
            wins: 0,
          };
          const next: ScenarioBest = {
            scenarioId,
            difficulty,
            completedDay:
              won && (prev.completedDay === null || completedDay < prev.completedDay)
                ? completedDay
                : prev.completedDay,
            killPercent: Math.max(prev.killPercent, killPercent),
            containedDays: Math.max(prev.containedDays, containedDays),
            attempts: prev.attempts + 1,
            wins: prev.wins + (won ? 1 : 0),
          };
          return {
            bests: { ...state.bests, [key]: next },
            totalGames: state.totalGames + 1,
            totalWins: state.totalWins + (won ? 1 : 0),
            totalDeaths: state.totalDeaths + deaths,
          };
        }),
      resetScores: () => set({ ...initial }),
    }),
    { name: 'miasma-scores', version: 1 },
  ),
);
