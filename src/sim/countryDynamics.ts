import type { GameEvent, GameState, BorderPolicy } from './types';
import { formatNews } from './newsTemplates';

const COLLAPSE_THRESHOLD = 4;
const COLLAPSE_LETHALITY_MULT = 1.6;
const PANIC_GROWTH_PER_DEATH_PCT = 8;
const PANIC_DECAY = 0.004;
const PANIC_DETECTED_DAILY = 0.01;
const PANIC_NEIGHBOUR_COLLAPSE = 0.05;

const RESPONSE_RAMP_BY_GOV: Record<string, number> = {
  democracy: 0.012,
  federation: 0.013,
  autocracy: 0.025,
  theocracy: 0.018,
  monarchy: 0.018,
  'failed-state': 0.002,
};

const BORDER_AUTO_CLOSE_PANIC = 0.55;

export interface CountryDynamicsResult {
  state: GameState;
  events: GameEvent[];
}

export function tickCountries(state: GameState): CountryDynamicsResult {
  const events: GameEvent[] = [];
  const next: Record<string, typeof state.countries[string]> = {};
  const collapsedCount = Object.values(state.countries).filter((c) => c.collapsed).length;

  for (const code of Object.keys(state.countries)) {
    const country = state.countries[code];
    const totalAlive = country.S + country.E + country.I + country.R || 1;
    const infectedRatio = (country.E + country.I) / totalAlive;
    const deathRatio = country.D / Math.max(1, country.population);
    const today = state.day;
    let nextCountry = { ...country };

    if (country.detected) {
      nextCountry.panicLevel = Math.min(
        1,
        country.panicLevel + PANIC_DETECTED_DAILY + deathRatio * PANIC_GROWTH_PER_DEATH_PCT,
      );
      if (collapsedCount > 0) {
        nextCountry.panicLevel = Math.min(
          1,
          nextCountry.panicLevel + PANIC_NEIGHBOUR_COLLAPSE * Math.min(5, collapsedCount) * 0.01,
        );
      }
      const ramp = RESPONSE_RAMP_BY_GOV[country.governmentType] ?? 0.01;
      nextCountry.responseLevel = Math.min(1, country.responseLevel + ramp);
    } else {
      nextCountry.panicLevel = Math.max(0, country.panicLevel - PANIC_DECAY);
    }

    if (
      !country.collapsed &&
      infectedRatio > country.healthcareCapacity * COLLAPSE_THRESHOLD &&
      country.E + country.I > 50_000
    ) {
      nextCountry.collapsed = true;
      nextCountry.collapsedDay = today;
      nextCountry.panicLevel = Math.min(1, nextCountry.panicLevel + 0.2);
      const news = formatNews(
        'country-collapsed',
        {
          country: country.name,
          flag: country.flagEmoji,
          city: 'major cities',
          pathogen: state.pathogen.name,
        },
        today * 31 + code.charCodeAt(0),
      );
      events.push({ day: today, text: news.text, kind: news.kind });
    }

    if (nextCountry.collapsed && deathRatio > 0.03 && Math.random() < 0.04) {
      const news = formatNews(
        'country-burning-bodies',
        {
          country: country.name,
          flag: country.flagEmoji,
          pathogen: state.pathogen.name,
        },
        today * 53 + code.charCodeAt(0),
      );
      events.push({ day: today, text: news.text, kind: news.kind });
    }

    const wantsClosed =
      country.detected &&
      country.borderPolicy !== 'closed' &&
      (nextCountry.panicLevel > BORDER_AUTO_CLOSE_PANIC ||
        country.governmentType === 'autocracy' ||
        country.governmentType === 'theocracy' ||
        country.governmentType === 'monarchy');
    if (wantsClosed) {
      nextCountry.borderPolicy = 'closed';
      nextCountry.bordersClosedDay = today;
      const news = formatNews(
        'country-borders-closed',
        { country: country.name, flag: country.flagEmoji },
        today * 71 + code.charCodeAt(0),
      );
      events.push({ day: today, text: news.text, kind: news.kind });
    } else if (
      country.detected &&
      country.borderPolicy === 'normal' &&
      nextCountry.responseLevel > 0.25
    ) {
      nextCountry.borderPolicy = 'screened';
    }

    if (
      country.governmentType !== 'failed-state' &&
      deathRatio > 0.08 &&
      nextCountry.responseLevel < 0.2 &&
      Math.random() < 0.005
    ) {
      nextCountry.governmentType = 'failed-state';
      const news = formatNews(
        'country-government-falls',
        { country: country.name, flag: country.flagEmoji },
        today * 91 + code.charCodeAt(0),
      );
      events.push({ day: today, text: news.text, kind: news.kind });
    }

    next[code] = nextCountry;
  }

  return { state: { ...state, countries: next }, events };
}

export function getBorderFluxMultiplier(policy: BorderPolicy): number {
  switch (policy) {
    case 'open':
      return 1.0;
    case 'normal':
      return 1.0;
    case 'screened':
      return 0.5;
    case 'closed':
      return 0.05;
  }
}

export function getLethalityMultiplier(state: GameState, countryCode: string): number {
  const country = state.countries[countryCode];
  if (!country) return 1;
  return country.collapsed ? COLLAPSE_LETHALITY_MULT : 1;
}
