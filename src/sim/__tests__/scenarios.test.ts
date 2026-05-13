import { describe, it, expect, beforeEach } from 'vitest';
import { SCENARIOS, SCENARIO_INDEX, scenariosForSide, defaultScenarioFor } from '../scenarios';
import { useGameStore } from '../../state/gameStore';

describe('scenarios', () => {
  it('exposes 8 scenarios, 4 per side', () => {
    expect(SCENARIOS).toHaveLength(8);
    expect(scenariosForSide('pathogen')).toHaveLength(4);
    expect(scenariosForSide('defender')).toHaveLength(4);
  });

  it('every scenario id is in the index', () => {
    for (const s of SCENARIOS) {
      expect(SCENARIO_INDEX[s.id]).toBe(s);
    }
  });

  it('defaultScenarioFor returns a sandbox scenario per side', () => {
    expect(defaultScenarioFor('pathogen').id).toBe('sandbox-pathogen');
    expect(defaultScenarioFor('defender').id).toBe('sandbox-defender');
  });

  beforeEach(() => useGameStore.getState().resetGame());

  it('bioterror-strike seeds multiple cities with infections', () => {
    useGameStore.getState().startGame({
      mode: 'pathogen',
      pathogenType: 'bioweapon',
      startCityId: 'nyc',
      scenarioId: 'bioterror-strike',
    });
    const cities = useGameStore.getState().cities;
    let infectedCities = 0;
    for (const id of ['nyc', 'lon', 'tok', 'mum', 'sao']) {
      if (cities[id] && cities[id].I > 0) infectedCities++;
    }
    expect(infectedCities).toBe(5);
  });

  it('vaccine-resistance-run starts on day 60 with recovered hosts', () => {
    useGameStore.getState().startGame({
      mode: 'pathogen',
      pathogenType: 'virus',
      startCityId: 'mum',
      scenarioId: 'vaccine-resistance-run',
    });
    const s = useGameStore.getState();
    expect(s.day).toBe(60);
    const totalR = Object.values(s.cities).reduce((acc, c) => acc + c.R, 0);
    expect(totalR).toBeGreaterThan(0);
    expect(s.cure.stages.sequencing.progress).toBe(1);
  });

  it('quarantine-island locks all non-allowlisted interventions', () => {
    useGameStore.getState().startGame({
      mode: 'defender',
      pathogenType: 'bioweapon',
      startCityId: 'hkg',
      scenarioId: 'quarantine-island',
    });
    const s = useGameStore.getState();
    expect(s.lockedInterventions.has('public-info')).toBe(true);
    expect(s.lockedInterventions.has('lockdown')).toBe(false);
  });

  it('mass-casualty pre-loads dead, infected, and lowers compliance', () => {
    useGameStore.getState().startGame({
      mode: 'defender',
      pathogenType: 'virus',
      startCityId: 'nyc',
      scenarioId: 'mass-casualty',
    });
    const s = useGameStore.getState();
    expect(s.day).toBe(90);
    const totalD = Object.values(s.cities).reduce((acc, c) => acc + c.D, 0);
    expect(totalD).toBeGreaterThan(0);
    expect(s.compliance).toBeLessThan(0.5);
  });

  it('cureRateMultiplier overrides default cure speed', () => {
    useGameStore.getState().startGame({
      mode: 'pathogen',
      pathogenType: 'bioweapon',
      startCityId: 'nyc',
      scenarioId: 'bioterror-strike',
    });
    expect(useGameStore.getState().scenarioCureMultiplier).toBeCloseTo(1.5, 4);
  });

  it('arctic-pole applies climate-tolerance override', () => {
    useGameStore.getState().startGame({
      mode: 'pathogen',
      pathogenType: 'bacteria',
      startCityId: 'rey',
      scenarioId: 'arctic-pole',
    });
    const s = useGameStore.getState();
    expect(s.pathogen.climateTolerance.arctic).toBeCloseTo(1.0, 4);
    expect(s.pathogen.climateTolerance.tropical).toBeLessThan(0.7);
  });
});
