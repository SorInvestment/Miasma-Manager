export type Climate = 'arctic' | 'temperate' | 'tropical' | 'arid';
export type Wealth = 1 | 2 | 3;
export type GameMode = 'pathogen' | 'defender';
export type Phase = 'menu' | 'scenarios' | 'settings' | 'start' | 'playing' | 'won' | 'lost';
export type Region = 'NA' | 'SA' | 'EU' | 'AF' | 'AS' | 'OC';
export type GovernmentType =
  | 'democracy'
  | 'autocracy'
  | 'theocracy'
  | 'failed-state'
  | 'federation'
  | 'monarchy';
export type BorderPolicy = 'open' | 'normal' | 'screened' | 'closed';

export interface Country {
  code: string;
  name: string;
  region: Region;
  population: number;
  ruralPopulation: number;
  wealth: Wealth;
  climate: Climate;
  healthcareCapacity: number;
  governmentType: GovernmentType;
  baseCompliance: number;
  drugResistance: number;
  flagEmoji: string;
}

export interface CountryState extends Country {
  S: number;
  E: number;
  I: number;
  R: number;
  D: number;
  infectedCities: number;
  detected: boolean;
  borderPolicy: BorderPolicy;
  collapsed: boolean;
  panicLevel: number;
  responseLevel: number;
  firstDetectedDay: number | null;
  collapsedDay: number | null;
  bordersClosedDay: number | null;
}
export type PathogenType = 'virus' | 'bacteria' | 'fungus' | 'parasite' | 'prion' | 'bioweapon';
export type Speed = 0 | 1 | 2 | 3 | 5;
export type Difficulty = 'casual' | 'normal' | 'hard' | 'brutal';
export type WinCondition =
  | 'standard'
  | 'kill-percent'
  | 'cure-before-day'
  | 'contain-spread'
  | 'time-survive';

export type InterventionId =
  | 'lockdown'
  | 'travel-ban-air'
  | 'travel-ban-sea'
  | 'travel-ban-land'
  | 'healthcare-surge'
  | 'public-info'
  | 'mask-mandate'
  | 'contact-tracing'
  | 'school-closure'
  | 'quarantine-facility'
  | 'vaccine-rollout-1'
  | 'vaccine-rollout-2'
  | 'antiviral-stockpile'
  | 'who-emergency-funding'
  | 'targeted-district-lockdown';

export interface CityPorts {
  air: string[];
  sea: string[];
  land: string[];
}

export interface StrainCompartment {
  E: number;
  I: number;
  R: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  population: number;
  S: number;
  E: number;
  I: number;
  R: number;
  D: number;
  climate: Climate;
  wealth: Wealth;
  ports: CityPorts;
  detected: boolean;
  interventions: Set<InterventionId>;
  healthcareCapacity: number;
  healthcareLoad: number;
  strainState: Record<string, StrainCompartment>;
}

export interface Strain {
  id: string;
  name: string;
  parentId: string | null;
  mutations: Set<string>;
  spawnedDay: number;
  transmissibility: number;
  incubation: number;
  infectiousPeriod: number;
  lethality: number;
  severity: number;
  drugResistance: number;
  climateTolerance: Record<Climate, number>;
}

export interface Pathogen {
  name: string;
  type: PathogenType;
  transmissibility: number;
  incubation: number;
  infectiousPeriod: number;
  lethality: number;
  severity: number;
  climateTolerance: Record<Climate, number>;
  drugResistance: number;
  mutations: Set<string>;
  variants: Strain[];
}

export type MutationCategory =
  | 'transmission'
  | 'symptom'
  | 'ability'
  | 'evasion'
  | 'lethality';

export interface MutationEffect {
  transmissibility?: number;
  incubation?: number;
  infectiousPeriod?: number;
  lethality?: number;
  severity?: number;
  drugResistance?: number;
  climateTolerance?: Partial<Record<Climate, number>>;
  complianceDelta?: number;
  surfacePersistence?: number;
  spawnsStrain?: boolean;
  reinfectionRate?: number;
  cureStageRollback?: { stageId: CureStageId; amount: number };
}

export interface Mutation {
  id: string;
  name: string;
  description: string;
  category: MutationCategory;
  cost: number;
  prereqs: string[];
  effect: MutationEffect;
  pathogenTypeOnly?: PathogenType[];
}

export interface Intervention {
  id: InterventionId;
  name: string;
  description: string;
  cost: number;
  scope: 'city' | 'global';
}

export interface GameEvent {
  day: number;
  text: string;
  kind: 'detection' | 'cure' | 'mutation' | 'intervention' | 'death' | 'system' | 'world-event';
}

export interface HistoryPoint {
  day: number;
  S: number;
  E: number;
  I: number;
  R: number;
  D: number;
  cure: number;
}

export type CureStageId = 'sequencing' | 'vaccine-rd' | 'trials' | 'distribution';

export interface CureStage {
  id: CureStageId;
  progress: number;
  funding: number;
  unlocked: boolean;
}

export interface CureState {
  stages: Record<CureStageId, CureStage>;
  activeStageId: CureStageId;
  overall: number;
}

export interface GameState {
  mode: GameMode;
  day: number;
  speed: Speed;
  cities: Record<string, City>;
  countries: Record<string, CountryState>;
  selectedCountryCode: string | null;
  pathogen: Pathogen;
  dnaPoints: number;
  budget: number;
  cureProgress: number;
  cureFundingLevel: number;
  cure: CureState;
  events: GameEvent[];
  phase: Phase;
  selectedCityId: string | null;
  history: HistoryPoint[];
  initialPopulation: number;
  autoPauseTriggers: Set<string>;
  compliance: number;
  globalInterventions: Set<InterventionId>;
  difficulty: Difficulty;
  scenarioId: string;
  winCondition: WinCondition;
  winThreshold: number;
  lockedInterventions: Set<InterventionId>;
  containedDays: number;
  scenarioCureMultiplier: number;
  scenarioDeathLimit: number;
  globalInterventionExpiry: Record<string, number>;
  cityInterventionExpiry: Record<string, Record<string, number>>;
}
