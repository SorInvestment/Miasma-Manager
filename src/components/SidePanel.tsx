import { useGameStore } from '../state/gameStore';
import { CURE_STAGE_ORDER, CURE_STAGE_LABELS } from '../sim/cure';

interface Props {
  onOpenMutations: () => void;
  onOpenInterventions: () => void;
  onOpenCharts: () => void;
}

function format(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

export function SidePanel({ onOpenMutations, onOpenInterventions, onOpenCharts }: Props) {
  const cities = useGameStore((s) => s.cities);
  const mode = useGameStore((s) => s.mode);
  const selectedId = useGameStore((s) => s.selectedCityId);
  const pathogen = useGameStore((s) => s.pathogen);
  const fundStageAction = useGameStore((s) => s.fundStageAction);
  const budget = useGameStore((s) => s.budget);
  const cure = useGameStore((s) => s.cure);

  let S = 0, E = 0, I = 0, R = 0, D = 0;
  let detected = 0;
  for (const c of Object.values(cities)) {
    S += c.S; E += c.E; I += c.I; R += c.R; D += c.D;
    if (c.detected) detected += 1;
  }
  const selected = selectedId ? cities[selectedId] : null;
  const selectedN = selected ? selected.S + selected.E + selected.I + selected.R : 0;
  const selectedRatio = selectedN > 0 && selected ? ((selected.E + selected.I) / selectedN) : 0;

  return (
    <aside
      data-testid="side-panel"
      className="flex w-80 flex-col gap-3 overflow-y-auto border-l border-ink-700 bg-ink-800 p-3 font-mono text-sm scrollbar-thin"
    >
      <section className="rounded-md border border-ink-700 bg-ink-700/40 p-3">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-300">Global</h3>
        <Stat label="Susceptible" value={format(S)} className="text-emerald-300" />
        <Stat label="Exposed" value={format(E)} className="text-amber-300" />
        <Stat label="Infected" value={format(I)} className="text-plague-300" />
        <Stat label="Recovered" value={format(R)} className="text-sky-300" />
        <Stat label="Dead" value={format(D)} className="text-plague-500" />
        <Stat label="Cities detected" value={`${detected} / ${Object.keys(cities).length}`} className="text-ink-100" />
      </section>

      <section className="rounded-md border border-ink-700 bg-ink-700/40 p-3">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-300">Pathogen</h3>
        <Stat label="Name" value={pathogen.name} className="text-plague-100" />
        <Stat label="Type" value={pathogen.type} className="text-plague-300" />
        <Stat label="Transmissibility" value={pathogen.transmissibility.toFixed(2)} className="text-plague-300" />
        <Stat label="Incubation (days)" value={pathogen.incubation.toFixed(1)} className="text-plague-300" />
        <Stat label="Infectious (days)" value={pathogen.infectiousPeriod.toFixed(1)} className="text-plague-300" />
        <Stat label="Lethality" value={`${(pathogen.lethality * 100).toFixed(1)}%`} className="text-plague-500" />
        <Stat label="Severity" value={pathogen.severity.toFixed(2)} className="text-plague-300" />
        <Stat label="Drug resistance" value={pathogen.drugResistance.toFixed(2)} className="text-plague-300" />
        <Stat label="Mutations" value={`${pathogen.mutations.size}`} className="text-plague-300" />
      </section>

      {selected && (
        <section
          data-testid="selected-city"
          className="rounded-md border border-plague-500/60 bg-plague-900/30 p-3"
        >
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-plague-300">
            {selected.name}, {selected.country}
          </h3>
          <Stat label="Population" value={format(selected.population)} />
          <Stat label="Infected" value={format(selected.E + selected.I)} className="text-plague-300" />
          <Stat label="Dead" value={format(selected.D)} className="text-plague-500" />
          <Stat label="Infection rate" value={`${(selectedRatio * 100).toFixed(2)}%`} />
          <Stat label="Climate" value={selected.climate} />
          <Stat label="Wealth" value={`${selected.wealth} / 3`} />
          <Stat label="Detected" value={selected.detected ? '✓' : '—'} />
          <Stat label="Interventions" value={selected.interventions.size > 0 ? Array.from(selected.interventions).join(', ') : 'none'} className="break-all text-xs" />
        </section>
      )}

      <div className="flex flex-col gap-2">
        {mode === 'pathogen' && (
          <button
            data-testid="open-mutations"
            onClick={onOpenMutations}
            className="rounded-md bg-plague-500 px-3 py-2 text-sm font-bold text-ink-900 hover:bg-plague-300"
          >
            Evolve Pathogen
          </button>
        )}
        {mode === 'defender' && (
          <>
            <button
              data-testid="open-interventions"
              onClick={onOpenInterventions}
              className="rounded-md bg-plague-500 px-3 py-2 text-sm font-bold text-ink-900 hover:bg-plague-300"
            >
              Deploy Interventions
            </button>
            <div className="rounded-md border border-ink-700 bg-ink-700/40 p-3">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-300">Fund Cure Stages</h3>
              <div className="flex flex-col gap-2">
                {CURE_STAGE_ORDER.map((id) => {
                  const stage = cure.stages[id];
                  const isActive = cure.activeStageId === id && stage.progress < 1;
                  return (
                    <div key={id} className={`rounded border p-2 ${isActive ? 'border-emerald-400/60 bg-emerald-900/10' : 'border-ink-600'}`}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-bold text-ink-100">{CURE_STAGE_LABELS[id]}</span>
                        <span className="text-xs tabular-nums text-emerald-300">{(stage.progress * 100).toFixed(0)}%</span>
                      </div>
                      <div className="mb-1 h-1.5 overflow-hidden rounded bg-ink-800">
                        <div className="h-full bg-emerald-400" style={{ width: `${stage.progress * 100}%` }} />
                      </div>
                      <div className="flex gap-1">
                        {[5, 10, 20].map((amt) => (
                          <button
                            key={amt}
                            data-testid={`fund-${id}-${amt}`}
                            disabled={budget < amt || !stage.unlocked || stage.progress >= 1}
                            onClick={() => fundStageAction(id, amt)}
                            className="flex-1 rounded bg-emerald-500 px-1 py-0.5 text-[10px] font-bold text-ink-900 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            +${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        <button
          data-testid="open-charts"
          onClick={onOpenCharts}
          className="rounded-md border border-ink-600 bg-ink-700 px-3 py-2 text-sm hover:bg-ink-600"
        >
          Charts
        </button>
      </div>
    </aside>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-xs">
      <span className="text-ink-300">{label}</span>
      <span className={`tabular-nums ${className ?? 'text-ink-100'}`}>{value}</span>
    </div>
  );
}
