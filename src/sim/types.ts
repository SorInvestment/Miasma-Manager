export type Climate = 'arctic' | 'temperate' | 'tropical' | 'arid';
export type Wealth = 1 | 2 | 3;
export type GameMode = 'pathogen' | 'defender';
export type Phase = 'start' | 'playing' | 'won' | 'lost';
export type PathogenType = 'virus' | 'bacteria' | 'fungus';
export type Speed = 0 | 1 | 2 | 5 | 10;

export type InterventionId =
  | 'lockdown'
  | 'travel-ban-air'
  | 'travel-ban-sea'
  | 'travel-ban-land'
  | 'healthcare-surge'
  | 'public-info';

export interface CityPorts {
  air: string[];
  sea: string[];
  land: string[];
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
}

export type MutationCategory =
  | 'transmission'
  | 'symptom'
  | 'ability'
  | 'lethality';

export interface MutationEffect {
  transmissibility?: number;
  incubation?: number;
  infectiousPeriod?: number;
  lethality?: number;
  severity?: number;
  drugResistance?: number;
  climateTolerance?: Partial<Record<Climate, number>>;
}

export interface Mutation {
  id: string;
  name: string;
  description: string;
  category: MutationCategory;
  cost: number;
  prereqs: string[];
  effect: MutationEffect;
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
  kind: 'detection' | 'cure' | 'mutation' | 'intervention' | 'death' | 'system';
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

export interface GameState {
  mode: GameMode;
  day: number;
  speed: Speed;
  cities: Record<string, City>;
  pathogen: Pathogen;
  dnaPoints: number;
  budget: number;
  cureProgress: number;
  cureFundingLevel: number;
  events: GameEvent[];
  phase: Phase;
  selectedCityId: string | null;
  history: HistoryPoint[];
  initialPopulation: number;
  autoPauseTriggers: Set<string>;
}
