import { useGameStore } from '../state/gameStore';
import { SCENARIO_INDEX } from '../sim/scenarios';
import { DIFFICULTY_LABELS } from '../sim/difficulty';
import type { City } from '../sim/types';

function format(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

interface Achievement { id: string; label: string; earned: boolean; }

function computeAchievements(opts: {
  cities: Record<string, City>;
  dead: number;
  initialPopulation: number;
  mutationsUsed: number;
  variantsSpawned: number;
  day: number;
  cureProgress: number;
}): Achievement[] {
  const anyLockdown = Object.values(opts.cities).some((c) => c.interventions.has('lockdown'));
  const killed90 = opts.dead / Math.max(1, opts.initialPopulation) >= 0.9;
  const curedFast = opts.cureProgress >= 1 && opts.day < 200;
  return [
    { id: 'pacifist', label: 'No Lockdowns Used', earned: !anyLockdown },
    { id: 'evolver', label: 'Spawned a Variant', earned: opts.variantsSpawned > 0 },
    { id: 'apocalypse', label: 'Killed 90%+', earned: killed90 },
    { id: 'rapid-vaccine', label: 'Cured Before Day 200', earned: curedFast },
    { id: 'specialist', label: '5+ Mutations Used', earned: opts.mutationsUsed >= 5 },
  ];
}

export function EndScreen() {
  const phase = useGameStore((s) => s.phase);
  const mode = useGameStore((s) => s.mode);
  const day = useGameStore((s) => s.day);
  const cities = useGameStore((s) => s.cities);
  const cureProgress = useGameStore((s) => s.cureProgress);
  const pathogen = useGameStore((s) => s.pathogen);
  const reset = useGameStore((s) => s.resetGame);
  const scenarioId = useGameStore((s) => s.scenarioId);
  const difficulty = useGameStore((s) => s.difficulty);
  const initialPopulation = useGameStore((s) => s.initialPopulation);

  let dead = 0, recovered = 0;
  let detected = 0;
  for (const c of Object.values(cities)) {
    dead += c.D; recovered += c.R;
    if (c.detected) detected += 1;
  }

  const scenarioName = SCENARIO_INDEX[scenarioId]?.name ?? 'Sandbox';
  const won = phase === 'won';
  const headline =
    mode === 'pathogen'
      ? won
        ? 'HUMANITY HAS FALLEN'
        : 'PATHOGEN ERADICATED'
      : won
        ? 'PANDEMIC CONTAINED'
        : 'PANDEMIC OVERWHELMS HUMANITY';
  const tone = won ? 'text-emerald-300' : 'text-plague-500';

  const achievements = computeAchievements({
    cities, dead, initialPopulation,
    mutationsUsed: pathogen.mutations.size,
    variantsSpawned: pathogen.variants.length,
    day, cureProgress,
  });

  return (
    <div
      data-testid="end-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
    >
      <div className="max-w-xl rounded-xl border border-ink-700 bg-ink-800 p-8 text-center shadow-2xl">
        <h2 className={`mb-1 font-mono text-3xl font-bold ${tone} glow-red`}>{headline}</h2>
        <p className="mb-1 text-sm text-ink-300">
          {scenarioName} · {DIFFICULTY_LABELS[difficulty]} · {mode === 'pathogen' ? 'Pathogen' : 'Defender'}
        </p>
        <p className="mb-6 text-xs text-ink-300">Day {day}</p>
        <dl className="mb-4 grid grid-cols-2 gap-2 text-left font-mono text-sm">
          <Item label="Pathogen" value={pathogen.name} />
          <Item label="Mutations" value={`${pathogen.mutations.size}`} />
          <Item label="Variants" value={`${pathogen.variants.length}`} />
          <Item label="Dead" value={format(dead)} />
          <Item label="Recovered" value={format(recovered)} />
          <Item label="Cities detected" value={`${detected}`} />
          <Item label="Cure progress" value={`${(cureProgress * 100).toFixed(1)}%`} />
        </dl>
        <div className="mb-6 flex flex-wrap justify-center gap-1.5" data-testid="achievements">
          {achievements.filter((a) => a.earned).map((a) => (
            <span
              key={a.id}
              data-testid={`achievement-${a.id}`}
              className="rounded-full border border-amber-500/50 bg-amber-900/30 px-2 py-0.5 text-xs text-amber-300"
            >
              ★ {a.label}
            </span>
          ))}
        </div>
        <button
          data-testid="restart-button"
          onClick={reset}
          className="rounded-md bg-plague-500 px-6 py-2 font-mono font-bold text-ink-900 hover:bg-plague-300"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-ink-700/40 px-2 py-1">
      <span className="text-ink-300">{label}</span>
      <span className="font-bold tabular-nums text-ink-100">{value}</span>
    </div>
  );
}
