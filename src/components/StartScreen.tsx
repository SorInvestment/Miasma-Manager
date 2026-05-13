import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { CITIES_LIST } from '../data/cities';
import type { Difficulty, GameMode, PathogenType } from '../sim/types';
import { DIFFICULTY_LIST, DIFFICULTY_LABELS, DIFFICULTY_BLURBS } from '../sim/difficulty';
import { scenariosForSide, SCENARIO_INDEX } from '../sim/scenarios';

const MODES: { id: GameMode; title: string; sub: string; description: string }[] = [
  {
    id: 'pathogen',
    title: 'The Pathogen',
    sub: 'Engineer the perfect plague',
    description: 'Mutate transmission and lethality. Spread before humanity finds a cure.',
  },
  {
    id: 'defender',
    title: 'The Defender',
    sub: 'Stop the pandemic',
    description: 'Spend public-health budget on lockdowns, healthcare, and research before too many die.',
  },
];

const PATHOGENS: { id: PathogenType; name: string; description: string }[] = [
  { id: 'virus', name: 'Virus', description: 'Fast-evolving, easily transmitted, harder to resist therapy.' },
  { id: 'bacteria', name: 'Bacteria', description: 'Hardy, persistent. Long infectious period; antibiotic resistance possible.' },
  { id: 'fungus', name: 'Fungus', description: 'Slow but inexorable. Excellent in warm climates; resists pharmaceuticals.' },
  { id: 'parasite', name: 'Parasite', description: 'Vector-locked. Tropical menace with slow climb and long carry.' },
  { id: 'prion', name: 'Prion', description: 'Silent for months. Then everyone dies. Extreme drug resistance.' },
  { id: 'bioweapon', name: 'Bioweapon', description: 'Engineered. Hot, loud, immediately detected. Race the cure.' },
];

export function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const goToPhase = useGameStore((s) => s.goToPhase);
  const [mode, setMode] = useState<GameMode>('pathogen');
  const [pathogenType, setPathogenType] = useState<PathogenType>('virus');
  const [startCityId, setStartCityId] = useState<string>('lon');
  const [pathogenName, setPathogenName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [scenarioId, setScenarioId] = useState<string>('sandbox-pathogen');

  const scenarios = useMemo(() => scenariosForSide(mode), [mode]);
  const selectedScenario = SCENARIO_INDEX[scenarioId] ?? scenarios[0];

  useEffect(() => {
    const stillValid = scenarios.find((s) => s.id === scenarioId);
    if (!stillValid) {
      setScenarioId(scenarios[0].id);
      setPathogenType(scenarios[0].pathogenType);
      setDifficulty(scenarios[0].recommendedDifficulty);
    }
  }, [mode, scenarios, scenarioId]);

  return (
    <div className="flex h-screen items-center justify-center overflow-auto bg-gradient-to-b from-ink-900 via-plague-900 to-ink-900 p-6">
      <div className="max-w-4xl rounded-xl border border-ink-700 bg-ink-800/80 p-8 shadow-2xl backdrop-blur">
        <header className="mb-6">
          <button
            data-testid="back-to-menu"
            onClick={() => goToPhase('menu')}
            className="mb-2 font-mono text-xs uppercase tracking-widest text-ink-300 hover:text-plague-300"
          >
            ← Main menu
          </button>
          <h1 className="font-mono text-4xl font-bold text-plague-500 glow-red">MIASMA MANAGER</h1>
          <p className="mt-1 text-ink-300">A scientifically-grounded plague simulation.</p>
        </header>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-300">Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  data-testid={`mode-${m.id}`}
                  onClick={() => setMode(m.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    active
                      ? 'border-plague-500 bg-plague-900/40 ring-2 ring-plague-500/50'
                      : 'border-ink-600 bg-ink-700/50 hover:border-ink-500'
                  }`}
                >
                  <div className="font-mono text-lg font-bold text-plague-100">{m.title}</div>
                  <div className="text-xs uppercase tracking-wider text-plague-300">{m.sub}</div>
                  <p className="mt-2 text-sm text-ink-300">{m.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-300">Scenario</h2>
          <div className="grid grid-cols-2 gap-2">
            {scenarios.map((s) => {
              const active = scenarioId === s.id;
              return (
                <button
                  key={s.id}
                  data-testid={`scenario-${s.id}`}
                  onClick={() => {
                    setScenarioId(s.id);
                    setPathogenType(s.pathogenType);
                    setDifficulty(s.recommendedDifficulty);
                  }}
                  className={`rounded-md border p-2 text-left transition ${
                    active
                      ? 'border-plague-500 bg-plague-900/40 ring-2 ring-plague-500/50'
                      : 'border-ink-600 bg-ink-700/50 hover:border-ink-500'
                  }`}
                >
                  <div className="font-mono text-sm font-bold">{s.name}</div>
                  <p className="mt-0.5 text-[11px] text-ink-300 leading-snug">{s.blurb}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-300">Pathogen Class</h2>
          <div className="grid grid-cols-3 gap-3">
            {PATHOGENS.map((p) => {
              const active = pathogenType === p.id;
              return (
                <button
                  key={p.id}
                  data-testid={`pathogen-${p.id}`}
                  onClick={() => setPathogenType(p.id)}
                  className={`rounded-lg border p-3 text-left transition ${
                    active
                      ? 'border-plague-500 bg-plague-900/40 ring-2 ring-plague-500/50'
                      : 'border-ink-600 bg-ink-700/50 hover:border-ink-500'
                  }`}
                >
                  <div className="font-mono text-base font-bold">{p.name}</div>
                  <p className="mt-1 text-xs text-ink-300">{p.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-ink-300">
              Pathogen Name
            </label>
            <input
              type="text"
              value={pathogenName}
              onChange={(e) => setPathogenName(e.target.value)}
              placeholder="e.g. Miasma-1"
              maxLength={32}
              data-testid="pathogen-name"
              className="w-full rounded-md border border-ink-600 bg-ink-700 px-3 py-2 font-mono text-sm text-ink-100 focus:border-plague-500 focus:outline-none focus:ring-1 focus:ring-plague-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-ink-300">
              {mode === 'pathogen' ? 'Outbreak Origin' : 'Patient Zero City'}
            </label>
            <select
              value={startCityId}
              onChange={(e) => setStartCityId(e.target.value)}
              data-testid="start-city"
              className="w-full rounded-md border border-ink-600 bg-ink-700 px-3 py-2 font-mono text-sm text-ink-100 focus:border-plague-500 focus:outline-none focus:ring-1 focus:ring-plague-500"
            >
              {CITIES_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-300">Difficulty</h2>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTY_LIST.map((d) => {
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  data-testid={`difficulty-${d}`}
                  onClick={() => setDifficulty(d)}
                  className={`rounded-md border p-2 text-left transition ${
                    active
                      ? 'border-plague-500 bg-plague-900/40 ring-2 ring-plague-500/50'
                      : 'border-ink-600 bg-ink-700/50 hover:border-ink-500'
                  }`}
                >
                  <div className="font-mono text-sm font-bold">{DIFFICULTY_LABELS[d]}</div>
                  <p className="mt-0.5 text-[10px] text-ink-300 leading-tight">{DIFFICULTY_BLURBS[d]}</p>
                </button>
              );
            })}
          </div>
        </section>

        <button
          data-testid="start-button"
          onClick={() =>
            startGame({
              mode,
              pathogenType: selectedScenario.id !== `sandbox-${mode}` ? selectedScenario.pathogenType : pathogenType,
              startCityId,
              pathogenName,
              difficulty,
              scenarioId: selectedScenario.id,
            })
          }
          className="w-full rounded-md bg-plague-500 px-4 py-3 font-mono text-lg font-bold text-ink-900 transition hover:bg-plague-300 active:scale-[0.99]"
        >
          BEGIN OUTBREAK
        </button>

        <p className="mt-4 text-center text-xs text-ink-300">
          {mode === 'pathogen'
            ? 'You play the disease. Mutate to spread further, faster, deadlier.'
            : 'You play humanity. Hold the line until the cure is ready.'}
        </p>
      </div>
    </div>
  );
}
