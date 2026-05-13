import { useGameStore } from '../state/gameStore';
import type { Speed } from '../sim/types';
import { CURE_STAGE_ORDER, CURE_STAGE_LABELS } from '../sim/cure';

const SPEEDS: Speed[] = [0, 1, 2, 3, 5];

function formatNumber(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

interface Props {
  onOpenCharts?: () => void;
}

export function TopBar(_props: Props) {
  const day = useGameStore((s) => s.day);
  const speed = useGameStore((s) => s.speed);
  const mode = useGameStore((s) => s.mode);
  const dnaPoints = useGameStore((s) => s.dnaPoints);
  const budget = useGameStore((s) => s.budget);
  const cure = useGameStore((s) => s.cure);
  const cureProgress = useGameStore((s) => s.cureProgress);
  const pathogenName = useGameStore((s) => s.pathogen.name);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const cities = useGameStore((s) => s.cities);
  const compliance = useGameStore((s) => s.compliance);

  let infected = 0, dead = 0;
  for (const c of Object.values(cities)) {
    infected += c.E + c.I;
    dead += c.D;
  }

  return (
    <header className="flex items-center justify-between border-b border-ink-700 bg-ink-800 px-4 py-2 font-mono text-sm">
      <div className="flex items-center gap-4">
        <div className="font-bold text-plague-500 glow-red" data-testid="game-title">
          MIASMA
        </div>
        <div className="text-ink-300">
          <span className="text-ink-100">{pathogenName}</span>{' '}
          <span className="rounded bg-ink-700 px-1.5 py-0.5 text-xs uppercase">{mode}</span>
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Speed controls">
          {SPEEDS.map((s) => {
            const active = speed === s;
            const label = s === 0 ? '⏸' : `${s}×`;
            return (
              <button
                key={s}
                data-testid={`speed-${s}`}
                onClick={() => setSpeed(s)}
                className={`min-w-[36px] rounded px-2 py-1 text-xs font-bold transition ${
                  active
                    ? 'bg-plague-500 text-ink-900'
                    : 'bg-ink-700 text-ink-100 hover:bg-ink-600'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-ink-100" data-testid="day-counter">
          Day <span className="font-bold">{day}</span>
        </div>
        {mode === 'pathogen' ? (
          <div className="text-plague-300" data-testid="dna-points">
            DNA <span className="font-bold text-plague-100">{dnaPoints.toFixed(0)}</span>
          </div>
        ) : (
          <div className="text-plague-300" data-testid="budget">
            Budget <span className="font-bold text-plague-100">${budget.toFixed(1)}M</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-ink-300">
          <span>Infected</span>
          <span className="font-bold text-plague-300" data-testid="infected-count">{formatNumber(infected)}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-300">
          <span>Dead</span>
          <span className="font-bold text-plague-500" data-testid="dead-count">{formatNumber(dead)}</span>
        </div>
        <div className="flex items-center gap-2" title="Public compliance — affects lockdown strength">
          <span className="text-ink-300">Comply</span>
          <div className="h-3 w-20 overflow-hidden rounded bg-ink-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all"
              style={{ width: `${compliance * 100}%` }}
              data-testid="compliance-bar"
            />
          </div>
          <span className="text-xs tabular-nums text-amber-300">
            {(compliance * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-2" data-testid="cure-stages">
          <span className="text-ink-300">Cure</span>
          <div className="flex gap-0.5" role="group" aria-label="Cure stages">
            {CURE_STAGE_ORDER.map((id) => {
              const stage = cure.stages[id];
              const active = cure.activeStageId === id && stage.progress < 1;
              return (
                <div
                  key={id}
                  title={`${CURE_STAGE_LABELS[id]}: ${(stage.progress * 100).toFixed(0)}%`}
                  className={`h-3 w-8 overflow-hidden rounded-sm border ${
                    active ? 'border-emerald-300 shadow-[0_0_4px_rgba(110,231,183,0.6)]' : 'border-ink-600'
                  } bg-ink-700`}
                  data-testid={`cure-stage-${id}`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all"
                    style={{ width: `${stage.progress * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
          <span className="text-xs tabular-nums text-emerald-300" data-testid="cure-bar">
            {(cureProgress * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </header>
  );
}
