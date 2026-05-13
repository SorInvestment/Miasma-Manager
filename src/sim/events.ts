import type { City, GameEvent, GameState, StrainCompartment } from './types';
import { adjustCompliance } from './compliance';
import { getMultipliers } from './difficulty';
import { ORIGIN_STRAIN_ID } from './strain';

export interface EventTrigger {
  id: string;
  weightPerTick: number;
  guard: (s: GameState) => boolean;
  apply: (s: GameState) => GameState;
  narrative: (s: GameState) => string;
}

function totalsByCountry(state: GameState): Set<string> {
  const out = new Set<string>();
  for (const c of Object.values(state.cities)) {
    if (c.I > 0 || c.E > 0) out.add(c.country);
  }
  return out;
}

function pickRandomCity(state: GameState, filter: (c: City) => boolean): City | undefined {
  const candidates = Object.values(state.cities).filter(filter);
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function emitEvent(state: GameState, text: string): GameState {
  const evt: GameEvent = { day: state.day, text, kind: 'world-event' };
  return { ...state, events: [...state.events, evt] };
}

function bumpStrainAt(city: City, strainId: string, deltaE: number, deltaI: number): City {
  const comp: StrainCompartment = city.strainState[strainId] ?? { E: 0, I: 0, R: 0 };
  const next: StrainCompartment = { ...comp, E: comp.E + deltaE, I: comp.I + deltaI };
  const draw = Math.min(city.S, deltaE + deltaI);
  return {
    ...city,
    S: Math.max(0, city.S - draw),
    E: city.E + deltaE,
    I: city.I + deltaI,
    strainState: { ...city.strainState, [strainId]: next },
  };
}

export const EVENT_TRIGGERS: EventTrigger[] = [
  {
    id: 'heat-wave',
    weightPerTick: 0.002,
    guard: (s) => Object.values(s.cities).some((c) => c.I > 0),
    apply: (s) => emitEvent(s, 'A regional heat wave is pushing people indoors and onto packed transit.'),
    narrative: () => 'Heat wave',
  },
  {
    id: 'refugee-surge',
    weightPerTick: 0.0015,
    guard: (s) => Object.values(s.cities).some((c) => c.I > 1_000 && c.wealth === 1),
    apply: (s) => {
      const target = pickRandomCity(s, (c) => c.wealth === 1 && c.I > 1_000);
      if (!target) return s;
      return emitEvent(s, `Civil unrest in ${target.name} drives a refugee surge.`);
    },
    narrative: () => 'Refugee surge',
  },
  {
    id: 'antivax-movement',
    weightPerTick: 0.0012,
    guard: (s) => s.day > 60 && Object.values(s.cities).filter((c) => c.detected).length > 5,
    apply: (s) => emitEvent(adjustCompliance(s, -0.1), 'An anti-vaccine movement gains traction online; compliance drops.'),
    narrative: () => 'Anti-vaccine movement',
  },
  {
    id: 'lab-leak-news',
    weightPerTick: 0.001,
    guard: (s) => s.day > 30,
    apply: (s) => {
      const stages = { ...s.cure.stages };
      stages['vaccine-rd'] = { ...stages['vaccine-rd'], funding: stages['vaccine-rd'].funding + 0.06 };
      const next = { ...s, cure: { ...s.cure, stages } };
      return emitEvent(adjustCompliance(next, -0.04), 'A leaked lab paper triggers public outrage. Vaccine R&D accelerates.');
    },
    narrative: () => 'Lab leak news',
  },
  {
    id: 'hospital-strike',
    weightPerTick: 0.0015,
    guard: (s) => Object.values(s.cities).some((c) => c.wealth === 3 && c.interventions.has('healthcare-surge')),
    apply: (s) => {
      const target = pickRandomCity(s, (c) => c.wealth === 3 && c.interventions.has('healthcare-surge'));
      if (!target) return s;
      const interventions = new Set(target.interventions);
      interventions.delete('healthcare-surge');
      const next = {
        ...s,
        cities: { ...s.cities, [target.id]: { ...target, interventions } },
      };
      return emitEvent(next, `Healthcare workers in ${target.name} have walked off the job.`);
    },
    narrative: () => 'Hospital strike',
  },
  {
    id: 'super-spreader-event',
    weightPerTick: 0.0025,
    guard: (s) => Object.values(s.cities).some((c) => c.detected && c.wealth >= 2 && c.I > 100),
    apply: (s) => {
      const target = pickRandomCity(s, (c) => c.detected && c.wealth >= 2 && c.I > 100);
      if (!target) return s;
      const next = {
        ...s,
        cities: { ...s.cities, [target.id]: bumpStrainAt(target, ORIGIN_STRAIN_ID, 200, 50) },
      };
      return emitEvent(next, `A super-spreader event in ${target.name} ignites a fresh cluster.`);
    },
    narrative: () => 'Super-spreader event',
  },
  {
    id: 'mutation-news-leak',
    weightPerTick: 0.001,
    guard: (s) => s.mode === 'defender' && s.pathogen.mutations.size > 2,
    apply: (s) => {
      const stages = { ...s.cure.stages };
      stages.sequencing = { ...stages.sequencing, progress: Math.min(1, stages.sequencing.progress + 0.05) };
      return emitEvent({ ...s, budget: s.budget + 20, cure: { ...s.cure, stages } }, 'A whistleblower leaks the pathogen genome to a wealthy lab.');
    },
    narrative: () => 'Mutation news leak',
  },
  {
    id: 'volcanic-disruption',
    weightPerTick: 0.0008,
    guard: () => true,
    apply: (s) => emitEvent(s, 'A volcanic eruption grounds flights across a continent for a week.'),
    narrative: () => 'Volcanic disruption',
  },
  {
    id: 'whistleblower',
    weightPerTick: 0.001,
    guard: (s) => s.mode === 'defender' && s.day > 20,
    apply: (s) => emitEvent({ ...s, budget: s.budget + 25 }, 'A research whistleblower triggers an emergency budget allocation.'),
    narrative: () => 'Whistleblower',
  },
  {
    id: 'funding-crisis',
    weightPerTick: 0.0012,
    guard: (s) => s.mode === 'defender' && s.day > 40,
    apply: (s) => emitEvent({ ...s, budget: Math.max(0, s.budget - 10) }, 'A funding crisis cuts the defender response budget.'),
    narrative: () => 'Funding crisis',
  },
  {
    id: 'cruise-ship-outbreak',
    weightPerTick: 0.0015,
    guard: (s) => Object.values(s.cities).some((c) => c.ports.sea.length > 0 && c.S > 1500),
    apply: (s) => {
      const target = pickRandomCity(s, (c) => c.ports.sea.length > 0 && c.S > 1500);
      if (!target) return s;
      const next = {
        ...s,
        cities: { ...s.cities, [target.id]: bumpStrainAt(target, ORIGIN_STRAIN_ID, 800, 700) },
      };
      return emitEvent(next, `A cruise ship offloads 1,500 cases in ${target.name}.`);
    },
    narrative: () => 'Cruise ship outbreak',
  },
  {
    id: 'successful-trial',
    weightPerTick: 0.0008,
    guard: (s) => s.cure.stages['vaccine-rd'].progress > 0.5 && s.cure.stages.trials.unlocked,
    apply: (s) => {
      const stages = { ...s.cure.stages };
      stages.trials = { ...stages.trials, progress: Math.min(1, stages.trials.progress + 0.2) };
      return emitEvent({ ...s, cure: { ...s.cure, stages } }, 'A surprisingly successful clinical trial leaps the bar.');
    },
    narrative: () => 'Successful trial',
  },
];

export function tryFireRandomEvent(state: GameState): GameState {
  if (totalsByCountry(state).size === 0) return state;
  const mults = getMultipliers(state.difficulty);
  let picked: EventTrigger | undefined;
  const candidates = EVENT_TRIGGERS.filter((e) => e.guard(state));
  for (const evt of candidates) {
    const weight = evt.weightPerTick * mults.eventWeight;
    if (Math.random() < weight) {
      picked = evt;
      break;
    }
  }
  if (!picked) return state;
  return picked.apply(state);
}
