import type { City, InterventionId, StrainCompartment } from './types';
import { TRANSPORT_FLUX, TRAVEL_BAN_FLUX_MULT } from './constants';
import { ORIGIN_STRAIN_ID, makeEmptyCompartment } from './strain';

type Mode = 'air' | 'sea' | 'land';

const banForMode: Record<Mode, InterventionId> = {
  air: 'travel-ban-air',
  sea: 'travel-ban-sea',
  land: 'travel-ban-land',
};

export interface TransportTransfer {
  fromId: string;
  toId: string;
  mode: Mode;
  count: number;
  strainId: string;
}

function strainIRecord(city: City): Record<string, number> {
  const out: Record<string, number> = {};
  let bookedI = 0;
  for (const [id, comp] of Object.entries(city.strainState)) {
    out[id] = comp.I;
    bookedI += comp.I;
  }
  const residual = city.I - bookedI;
  if (residual > 0.5) {
    out[ORIGIN_STRAIN_ID] = (out[ORIGIN_STRAIN_ID] ?? 0) + residual;
  }
  return out;
}

export function computeTransfers(cities: Record<string, City>, globalTravelBans: Set<InterventionId>): TransportTransfer[] {
  const transfers: TransportTransfer[] = [];
  for (const from of Object.values(cities)) {
    if (from.I <= 0) continue;
    const fromN = from.S + from.E + from.I + from.R;
    if (fromN <= 0) continue;
    const infectiousFraction = from.I / fromN;
    const strainI = strainIRecord(from);
    for (const mode of ['air', 'sea', 'land'] as const) {
      const baseRate = TRANSPORT_FLUX[mode];
      const banId = banForMode[mode];
      const fromBan = from.interventions.has(banId);
      const globalBan = globalTravelBans.has(banId);
      for (const toId of from.ports[mode]) {
        const to = cities[toId];
        if (!to) continue;
        const toBan = to.interventions.has(banId);
        const banMult = fromBan || toBan || globalBan ? TRAVEL_BAN_FLUX_MULT : 1;
        const flux = Math.min(from.population, to.population) / 1_000_000;
        const movers = baseRate * flux * banMult * 1_000_000;
        const totalInfectedMovers = Math.min(from.I, movers * infectiousFraction);
        if (totalInfectedMovers <= 0.0001) continue;
        for (const [strainId, strainICount] of Object.entries(strainI)) {
          if (strainICount <= 0) continue;
          const shareCount = totalInfectedMovers * (strainICount / from.I);
          if (shareCount > 0.0001) {
            transfers.push({ fromId: from.id, toId: to.id, mode, count: shareCount, strainId });
          }
        }
      }
    }
  }
  return transfers;
}

export function applyTransfers(cities: Record<string, City>, transfers: TransportTransfer[]): Record<string, City> {
  if (transfers.length === 0) return cities;
  const next: Record<string, City> = { ...cities };
  for (const t of transfers) {
    const from = next[t.fromId];
    const to = next[t.toId];
    if (!from || !to) continue;
    const fromComp = from.strainState[t.strainId] ?? makeEmptyCompartment();
    const moveCount = Math.min(fromComp.I > 0 ? fromComp.I : from.I, t.count);
    if (moveCount <= 0) continue;

    const fromStrainState = { ...from.strainState };
    const fromNextComp: StrainCompartment = {
      ...fromComp,
      I: Math.max(0, fromComp.I - moveCount),
    };
    fromStrainState[t.strainId] = fromNextComp;

    const toComp = to.strainState[t.strainId] ?? makeEmptyCompartment();
    const toStrainState = { ...to.strainState };
    toStrainState[t.strainId] = {
      ...toComp,
      E: toComp.E + moveCount,
    };

    next[t.fromId] = {
      ...from,
      I: Math.max(0, from.I - moveCount),
      strainState: fromStrainState,
    };
    next[t.toId] = {
      ...to,
      S: Math.max(0, to.S - moveCount * 0.05),
      E: to.E + moveCount,
      strainState: toStrainState,
    };
  }
  return next;
}
