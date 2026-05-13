import type { City, GameState } from './types';

export const COMPLIANCE_MIN = 0.05;
export const COMPLIANCE_MAX = 1.0;
export const COMPLIANCE_INITIAL = 0.85;

export const LOCKDOWN_DEPLOY_PENALTY = 0.02;
export const PUBLIC_INFO_BONUS = 0.05;
export const PER_TICK_LOCKDOWN_DECAY = 0.0006;
export const PER_TICK_RECOVERY = 0.0008;

export function clampCompliance(value: number): number {
  return Math.max(COMPLIANCE_MIN, Math.min(COMPLIANCE_MAX, value));
}

export function adjustCompliance(state: GameState, delta: number): GameState {
  if (delta === 0) return state;
  const next = clampCompliance(state.compliance + delta);
  if (next === state.compliance) return state;
  return { ...state, compliance: next };
}

export function countLockdowns(cities: Record<string, City>): number {
  let n = 0;
  for (const c of Object.values(cities)) if (c.interventions.has('lockdown')) n++;
  return n;
}

export function detectionCoverage(cities: Record<string, City>): number {
  const all = Object.values(cities);
  if (all.length === 0) return 0;
  let detected = 0;
  for (const c of all) if (c.detected) detected++;
  return detected / all.length;
}

export function applyComplianceTickDelta(state: GameState): GameState {
  const lockdowns = countLockdowns(state.cities);
  if (lockdowns > 0) {
    return adjustCompliance(state, -PER_TICK_LOCKDOWN_DECAY * lockdowns);
  }
  if (detectionCoverage(state.cities) < 0.5) {
    return adjustCompliance(state, PER_TICK_RECOVERY);
  }
  return state;
}

export function lockdownEffectMultiplier(baseMult: number, compliance: number): number {
  const c = clampCompliance(compliance);
  return baseMult + (1 - baseMult) * (1 - c);
}
