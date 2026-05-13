import { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { useScoresStore } from '../state/scoresStore';
import { SCENARIOS } from '../sim/scenarios';
import type { GameMode } from '../sim/types';

const FILTER_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'pathogen', label: 'Pathogen' },
  { id: 'defender', label: 'Defender' },
] as const;

type Filter = (typeof FILTER_PILLS)[number]['id'];

const COVER_GRADIENT_FOR: Record<GameMode, string> = {
  pathogen: 'from-plague-700/60 via-plague-900/80 to-ink-900',
  defender: 'from-cyan-900/40 via-ink-800/90 to-ink-900',
};

export function ScenariosScreen() {
  const goToPhase = useGameStore((s) => s.goToPhase);
  const startGame = useGameStore((s) => s.startGame);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const bests = useScoresStore((s) => s.bests);
  const [filter, setFilter] = useState<Filter>('all');

  const visible = SCENARIOS.filter((s) => filter === 'all' || s.side === filter);

  return (
    <div className="flex h-screen flex-col overflow-auto bg-gradient-to-b from-ink-900 via-plague-900/40 to-ink-900 p-6 text-ink-100">
      <header className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between">
        <div>
          <button
            data-testid="back-to-menu"
            onClick={() => goToPhase('menu')}
            className="font-mono text-xs uppercase tracking-widest text-ink-300 hover:text-plague-300"
          >
            ← Main menu
          </button>
          <h1 className="font-mono text-3xl font-bold text-plague-500 glow-red">SCENARIOS</h1>
          <p className="text-ink-300">Curated outbreak campaigns. Each tests different mechanics.</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Filter">
          {FILTER_PILLS.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition ${
                filter === p.id
                  ? 'bg-plague-500 text-ink-900'
                  : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((scn) => {
          const key = `${scn.id}:${scn.recommendedDifficulty}`;
          const best = bests[key];
          return (
            <button
              key={scn.id}
              data-testid={`scenario-card-${scn.id}`}
              onClick={() => {
                setDifficulty(scn.recommendedDifficulty);
                if (scn.id.startsWith('sandbox')) {
                  goToPhase('start');
                } else {
                  startGame({
                    mode: scn.side,
                    pathogenType: scn.pathogenType,
                    startCityId: scn.modifiers.startCities?.[0] ?? 'lon',
                    pathogenName: scn.name,
                    difficulty: scn.recommendedDifficulty,
                    scenarioId: scn.id,
                  });
                }
              }}
              className={`group relative flex h-44 flex-col justify-between overflow-hidden rounded-lg border border-ink-700 bg-gradient-to-br ${
                COVER_GRADIENT_FOR[scn.side]
              } p-4 text-left transition-all hover:border-plague-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.25)]`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-ink-900/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-300">
                    {scn.side}
                  </span>
                  <span className="rounded bg-ink-900/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                    {scn.recommendedDifficulty}
                  </span>
                  {best?.wins ? (
                    <span
                      data-testid={`scenario-won-${scn.id}`}
                      title="Cleared"
                      className="rounded bg-emerald-700/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-100"
                    >
                      ✓ {best.wins}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-2 font-mono text-xl font-bold tracking-wide text-ink-50">
                  {scn.name}
                </h2>
                <p className="mt-1 text-xs leading-snug text-ink-200">{scn.blurb}</p>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-ink-300">
                {best?.completedDay != null
                  ? `Best run: D${best.completedDay}`
                  : 'Not cleared'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
