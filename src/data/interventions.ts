import type { Intervention } from '../sim/types';

export const INTERVENTIONS: Intervention[] = [
  {
    id: 'lockdown',
    name: 'Lockdown',
    description: 'Severely restrict in-city contact (β × 0.22).',
    cost: 6,
    scope: 'city',
  },
  {
    id: 'travel-ban-air',
    name: 'Air Travel Ban',
    description: 'Close airports; cuts air-borne population flux.',
    cost: 4,
    scope: 'city',
  },
  {
    id: 'travel-ban-sea',
    name: 'Sea Travel Ban',
    description: 'Close seaports.',
    cost: 3,
    scope: 'city',
  },
  {
    id: 'travel-ban-land',
    name: 'Land Border Closure',
    description: 'Seal land borders.',
    cost: 3,
    scope: 'city',
  },
  {
    id: 'healthcare-surge',
    name: 'Healthcare Surge',
    description: 'Surge ICUs and supplies; lethality × 0.45 in this city.',
    cost: 8,
    scope: 'city',
  },
  {
    id: 'public-info',
    name: 'Public Info Campaign',
    description: 'Global behavior change (β × 0.78 globally).',
    cost: 12,
    scope: 'global',
  },
];

export const INTERVENTION_INDEX: Record<string, Intervention> = Object.fromEntries(
  INTERVENTIONS.map((i) => [i.id, i]),
);
