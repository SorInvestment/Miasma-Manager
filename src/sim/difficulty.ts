import type { Difficulty } from './types';

export interface DifficultyMultipliers {
  cureRate: number;
  aiMutate: number;
  startResources: number;
  interventionCost: number;
  detection: number;
  eventWeight: number;
}

export const DIFFICULTY: Record<Difficulty, DifficultyMultipliers> = {
  casual: {
    cureRate: 0.75, aiMutate: 1.4, startResources: 1.5,
    interventionCost: 0.75, detection: 1.2, eventWeight: 0.6,
  },
  normal: {
    cureRate: 1.0, aiMutate: 1.0, startResources: 1.0,
    interventionCost: 1.0, detection: 1.0, eventWeight: 1.0,
  },
  hard: {
    cureRate: 1.25, aiMutate: 0.75, startResources: 0.8,
    interventionCost: 1.2, detection: 0.85, eventWeight: 1.3,
  },
  brutal: {
    cureRate: 1.6, aiMutate: 0.55, startResources: 0.6,
    interventionCost: 1.5, detection: 0.7, eventWeight: 1.6,
  },
};

export function getMultipliers(d: Difficulty): DifficultyMultipliers {
  return DIFFICULTY[d];
}

export const DIFFICULTY_LIST: Difficulty[] = ['casual', 'normal', 'hard', 'brutal'];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  casual: 'Casual',
  normal: 'Normal',
  hard: 'Hard',
  brutal: 'Brutal',
};

export const DIFFICULTY_BLURBS: Record<Difficulty, string> = {
  casual: 'Cure is slow. Resources are plentiful. Ideal for first play.',
  normal: 'Balanced. The reference difficulty.',
  hard: 'Cure is fast. Resources are tighter. AI mutates aggressively.',
  brutal: 'Cure races ahead. Money is scarce. Every decision counts.',
};
