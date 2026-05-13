import { useGameStore } from '../state/gameStore';
import { INTERVENTIONS } from '../data/interventions';

interface Props {
  onClose: () => void;
}

export function InterventionPanel({ onClose }: Props) {
  const budget = useGameStore((s) => s.budget);
  const selectedCityId = useGameStore((s) => s.selectedCityId);
  const cities = useGameStore((s) => s.cities);
  const deploy = useGameStore((s) => s.deployInterventionAction);
  const lockedInterventions = useGameStore((s) => s.lockedInterventions);
  const globalInterventions = useGameStore((s) => s.globalInterventions);
  const selected = selectedCityId ? cities[selectedCityId] : null;

  return (
    <div
      data-testid="intervention-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl border border-cyan-700 bg-ink-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-ink-700 bg-cyan-900/20 px-4 py-3">
          <div>
            <h2 className="font-mono text-lg font-bold text-cyan-300">Public Health Interventions</h2>
            <p className="text-xs text-ink-300">
              {selected
                ? `Target: ${selected.name}, ${selected.country}`
                : 'Select a city on the map for city-scope interventions.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-cyan-300">
              Budget <span className="font-bold" data-testid="budget-balance">${budget.toFixed(1)}M</span>
            </div>
            <button
              onClick={onClose}
              data-testid="close-interventions"
              className="rounded bg-ink-700 px-3 py-1 text-sm hover:bg-ink-600"
            >
              Close
            </button>
          </div>
        </header>

        <div className="grid max-h-[calc(85vh-80px)] grid-cols-2 gap-3 overflow-y-auto p-4 scrollbar-thin">
          {INTERVENTIONS.map((i) => {
            const isGlobal = i.scope === 'global';
            const targetId = isGlobal ? null : selectedCityId;
            const alreadyApplied = isGlobal
              ? globalInterventions.has(i.id)
              : targetId ? cities[targetId]?.interventions.has(i.id) : false;
            const isLocked = lockedInterventions.has(i.id);
            const canAfford = budget >= i.cost;
            const canDeploy = !isLocked && canAfford && !alreadyApplied && (isGlobal || !!selectedCityId);

            return (
              <button
                key={i.id}
                data-testid={`intervention-${i.id}`}
                onClick={() => canDeploy && deploy(i.id, targetId)}
                disabled={!canDeploy}
                className={`rounded-lg border p-3 text-left transition ${
                  isLocked
                    ? 'border-ink-800 bg-ink-800/50 opacity-40'
                    : alreadyApplied
                      ? 'border-emerald-700 bg-emerald-900/30 opacity-60'
                      : canDeploy
                        ? 'border-cyan-700 bg-cyan-900/20 hover:bg-cyan-900/40'
                        : 'border-ink-700 bg-ink-700/30 opacity-50'
                } ${canDeploy ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-cyan-100">{i.name}</span>
                  <span className="text-xs text-cyan-300">
                    {isLocked ? 'Locked' : alreadyApplied ? 'Active ✓' : `$${i.cost}M`}
                  </span>
                </div>
                <p className="text-xs text-ink-300">{i.description}</p>
                <p className="mt-1 text-[10px] text-cyan-300">
                  Scope: <span className="uppercase">{i.scope}</span>
                  {!isGlobal && !selectedCityId && !isLocked && <span className="ml-1 text-amber-300">(select a city)</span>}
                  {isLocked && <span className="ml-1 text-amber-300">(scenario-locked)</span>}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
