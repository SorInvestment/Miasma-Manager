import type { City, InterventionId } from './types';
import { TRANSPORT_FLUX, TRAVEL_BAN_FLUX_MULT } from './constants';

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
}

export function computeTransfers(cities: Record<string, City>, globalTravelBans: Set<InterventionId>): TransportTransfer[] {
  const transfers: TransportTransfer[] = [];
  for (const from of Object.values(cities)) {
    if (from.I <= 0) continue;
    const fromN = from.S + from.E + from.I + from.R;
    if (fromN <= 0) continue;
    const infectiousFraction = from.I / fromN;
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
        const infectedMovers = Math.min(from.I, movers * infectiousFraction);
        if (infectedMovers > 0.0001) {
          transfers.push({ fromId: from.id, toId: to.id, mode, count: infectedMovers });
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
    const moveCount = Math.min(from.I, t.count);
    if (moveCount <= 0) continue;
    next[t.fromId] = { ...from, I: Math.max(0, from.I - moveCount) };
    next[t.toId] = { ...to, S: Math.max(0, to.S - moveCount * 0.05), E: to.E + moveCount };
  }
  return next;
}
