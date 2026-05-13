export const TICK_MS_PER_DAY_AT_1X = 600;

export const TRANSPORT_FLUX = {
  air: 0.0011,
  sea: 0.00035,
  land: 0.00075,
} as const;

export const DETECTION_THRESHOLD = 0.0006;

export const BASE_CURE_RATE = 0.00009;
export const PASSIVE_CURE_RATE = 0.000022;

export const DNA_PER_NEW_INFECTION = 0.0000028;
export const DNA_NEW_COUNTRY_BONUS = 3;
export const DNA_FIRST_DEATH_BONUS = 2;

export const BUDGET_PER_DAY_BASE = 0.45;
export const BUDGET_PER_HEALTHY_BILLION = 0.85;

export const PATHOGEN_AI_MUTATE_INTERVAL = 28;

export const DEFENDER_DEATH_LIMIT_RATIO = 0.06;

export const LOCKDOWN_BETA_MULT = 0.22;
export const PUBLIC_INFO_GLOBAL_BETA_MULT = 0.78;

export const TRAVEL_BAN_FLUX_MULT = 0.08;
