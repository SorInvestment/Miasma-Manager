export const TICK_MS_PER_DAY_AT_1X = 250;

export const TRANSPORT_FLUX = {
  air: 0.0018,
  sea: 0.0005,
  land: 0.0011,
} as const;

export const DETECTION_THRESHOLD = 0.0008;

export const BASE_CURE_RATE = 0.00018;
export const PASSIVE_CURE_RATE = 0.000035;

export const DNA_PER_NEW_INFECTION = 0.000004;
export const DNA_NEW_COUNTRY_BONUS = 3;
export const DNA_FIRST_DEATH_BONUS = 2;

export const BUDGET_PER_DAY_BASE = 0.6;
export const BUDGET_PER_HEALTHY_BILLION = 1.2;

export const PATHOGEN_AI_MUTATE_INTERVAL = 18;

export const DEFENDER_DEATH_LIMIT_RATIO = 0.06;

export const LOCKDOWN_BETA_MULT = 0.22;
export const HEALTHCARE_LETHALITY_MULT = 0.45;
export const PUBLIC_INFO_GLOBAL_BETA_MULT = 0.78;

export const TRAVEL_BAN_FLUX_MULT = 0.08;
