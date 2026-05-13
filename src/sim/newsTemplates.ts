import type { GameEvent } from './types';

export type NewsTemplateId =
  | 'country-detected'
  | 'country-collapsed'
  | 'country-burning-bodies'
  | 'country-mass-graves'
  | 'country-borders-closed'
  | 'country-martial-law'
  | 'country-vaccine-arrives'
  | 'country-government-falls'
  | 'cruise-ship-outbreak'
  | 'cure-breakthrough'
  | 'antivax-rally'
  | 'refugee-crossing'
  | 'who-warning'
  | 'patient-zero'
  | 'first-international-spread';

export type NewsSeverity = 1 | 2 | 3;

export interface NewsTemplate {
  id: NewsTemplateId;
  kind: GameEvent['kind'];
  severity: NewsSeverity;
  variants: string[];
}

export interface NewsContext {
  country?: string;
  flag?: string;
  city?: string;
  percent?: number;
  day?: number;
  pathogen?: string;
  count?: number;
}

export const NEWS_TEMPLATES: Record<NewsTemplateId, NewsTemplate> = {
  'patient-zero': {
    id: 'patient-zero',
    kind: 'system',
    severity: 1,
    variants: [
      '{flag} Outbreak begins in {city}, {country}.',
      '{flag} Strange illness reported in {city}, {country}.',
      '{flag} Cluster of cases under investigation in {city}.',
    ],
  },
  'country-detected': {
    id: 'country-detected',
    kind: 'detection',
    severity: 1,
    variants: [
      '{flag} {country} confirms first cases of {pathogen}.',
      '{flag} Health authorities in {country} acknowledge outbreak.',
      '{flag} {country} declares state of public-health emergency.',
    ],
  },
  'first-international-spread': {
    id: 'first-international-spread',
    kind: 'world-event',
    severity: 2,
    variants: [
      '{flag} {pathogen} crosses borders into {country}.',
      '{flag} WHO confirms international spread; {country} reports cases.',
    ],
  },
  'country-borders-closed': {
    id: 'country-borders-closed',
    kind: 'intervention',
    severity: 2,
    variants: [
      '{flag} {country} closes all borders effective immediately.',
      '{flag} {country} halts international travel; airports shuttered.',
      '{flag} Border guards sealed at {country}.',
    ],
  },
  'country-martial-law': {
    id: 'country-martial-law',
    kind: 'intervention',
    severity: 3,
    variants: [
      '{flag} {country} declares martial law as panic rises.',
      '{flag} Military deployed to streets of {country}.',
      '{flag} Curfews enforced nationwide in {country}.',
    ],
  },
  'country-collapsed': {
    id: 'country-collapsed',
    kind: 'world-event',
    severity: 3,
    variants: [
      '{flag} Healthcare in {country} has collapsed — hospitals turn patients away.',
      '{flag} {country} hospitals overflow; ICUs at 300% capacity.',
      '{flag} Medical system in {country} disintegrates under the strain.',
    ],
  },
  'country-burning-bodies': {
    id: 'country-burning-bodies',
    kind: 'world-event',
    severity: 3,
    variants: [
      '{flag} {country} burning bodies on city outskirts; cameras barred.',
      '{flag} Pyres seen across {country} as morgues overflow.',
      '{flag} {country} authorities cremate dead in open lots.',
    ],
  },
  'country-mass-graves': {
    id: 'country-mass-graves',
    kind: 'world-event',
    severity: 3,
    variants: [
      '{flag} Mass graves dug outside {city}, {country}.',
      '{flag} Satellite images show pit burials in {country}.',
      '{flag} {country} resorts to mass burials as toll mounts.',
    ],
  },
  'country-vaccine-arrives': {
    id: 'country-vaccine-arrives',
    kind: 'cure',
    severity: 1,
    variants: [
      '{flag} First vaccine shipment arrives in {country}.',
      '{flag} {country} begins emergency vaccinations.',
      '{flag} Hope in {country}: cure rollout underway.',
    ],
  },
  'country-government-falls': {
    id: 'country-government-falls',
    kind: 'world-event',
    severity: 3,
    variants: [
      '{flag} Government collapses in {country} amid pandemic chaos.',
      '{flag} Riots topple leadership in {country}.',
      '{flag} {country} declared a failed state by international observers.',
    ],
  },
  'cruise-ship-outbreak': {
    id: 'cruise-ship-outbreak',
    kind: 'world-event',
    severity: 2,
    variants: [
      'Cruise ship outbreak: 1,500 stranded passengers test positive off {country}.',
      'Quarantined cruise liner reports mass infection near {country}.',
    ],
  },
  'cure-breakthrough': {
    id: 'cure-breakthrough',
    kind: 'cure',
    severity: 1,
    variants: [
      'Scientific breakthrough: {pathogen} structure revealed.',
      'Promising trial results announced for {pathogen} treatment.',
      'WHO praises rapid progress on {pathogen} cure.',
    ],
  },
  'antivax-rally': {
    id: 'antivax-rally',
    kind: 'world-event',
    severity: 2,
    variants: [
      '{flag} Anti-vaccination protests sweep {country}.',
      '{flag} Public defies lockdowns in {country}; rallies turn violent.',
      'Conspiracy movements gain ground in {country} as compliance falls.',
    ],
  },
  'refugee-crossing': {
    id: 'refugee-crossing',
    kind: 'world-event',
    severity: 2,
    variants: [
      '{flag} Refugees flee {country} carrying {pathogen} beyond borders.',
      'Mass exodus from {country} overwhelms neighbouring states.',
    ],
  },
  'who-warning': {
    id: 'who-warning',
    kind: 'world-event',
    severity: 2,
    variants: [
      'WHO Director-General: "{pathogen} is the most serious threat in a generation."',
      'Emergency WHO summit convened over {pathogen} outbreak.',
      'Global health agencies coordinate emergency response.',
    ],
  },
};

function pick<T>(arr: T[], seed: number): T {
  if (arr.length === 0) throw new Error('pick from empty array');
  return arr[Math.abs(seed) % arr.length];
}

export function formatNews(
  id: NewsTemplateId,
  ctx: NewsContext,
  seed: number = Date.now(),
): { text: string; kind: GameEvent['kind']; severity: NewsSeverity } {
  const tpl = NEWS_TEMPLATES[id];
  if (!tpl) throw new Error(`Unknown news template: ${id}`);
  const variant = pick(tpl.variants, seed);
  const text = variant
    .replaceAll('{country}', ctx.country ?? 'a country')
    .replaceAll('{flag}', ctx.flag ?? '🏳️')
    .replaceAll('{city}', ctx.city ?? 'the capital')
    .replaceAll('{pathogen}', ctx.pathogen ?? 'the pathogen')
    .replaceAll('{percent}', String(Math.round(ctx.percent ?? 0)))
    .replaceAll('{day}', String(ctx.day ?? 0))
    .replaceAll('{count}', String(ctx.count ?? 0));
  return { text, kind: tpl.kind, severity: tpl.severity };
}
