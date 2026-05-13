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
  {
    id: 'mask-mandate',
    name: 'Mask Mandate',
    description: 'City-wide masking. β × 0.7 in this city, lowers compliance over time.',
    cost: 5,
    scope: 'city',
  },
  {
    id: 'contact-tracing',
    name: 'Contact Tracing',
    description: 'Wealth-2+ cities only. Removes ~30% of newly exposed from circulation.',
    cost: 7,
    scope: 'city',
  },
  {
    id: 'school-closure',
    name: 'School Closure',
    description: 'β × 0.85 for 60 days, then auto-expires.',
    cost: 4,
    scope: 'city',
  },
  {
    id: 'quarantine-facility',
    name: 'Quarantine Facility',
    description: 'Removes 0.2% of infected per tick into isolated care.',
    cost: 9,
    scope: 'city',
  },
  {
    id: 'vaccine-rollout-1',
    name: 'Vaccine Rollout — Phase 1',
    description: 'Requires distribution stage ≥ 0.3. Converts 0.05%/tick of S→R globally.',
    cost: 14,
    scope: 'global',
  },
  {
    id: 'vaccine-rollout-2',
    name: 'Vaccine Rollout — Phase 2',
    description: 'Requires Phase 1. 0.18%/tick S→R, β × 0.85 globally.',
    cost: 22,
    scope: 'global',
  },
  {
    id: 'antiviral-stockpile',
    name: 'Antiviral Stockpile',
    description: 'Lethality × 0.7 globally for 90 days. Auto-expires.',
    cost: 11,
    scope: 'global',
  },
  {
    id: 'who-emergency-funding',
    name: 'WHO Emergency Funding',
    description: 'Instant +20 budget and +0.3 funding to every cure stage.',
    cost: 6,
    scope: 'global',
  },
  {
    id: 'targeted-district-lockdown',
    name: 'Targeted District Lockdown',
    description: 'β × 0.5 only in cities currently hot (I/N > 2%). No compliance cost.',
    cost: 3,
    scope: 'city',
  },
];

export const INTERVENTION_INDEX: Record<string, Intervention> = Object.fromEntries(
  INTERVENTIONS.map((i) => [i.id, i]),
);
