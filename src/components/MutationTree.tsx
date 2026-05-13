import { useGameStore } from '../state/gameStore';
import { MUTATIONS } from '../data/mutations';
import type { Mutation, MutationCategory } from '../sim/types';

interface Props {
  onClose: () => void;
}

const CATEGORY_TITLES: Record<MutationCategory, string> = {
  transmission: 'Transmission',
  symptom: 'Symptoms',
  ability: 'Abilities',
  evasion: 'Evasion',
  lethality: 'Lethality',
};

const CATEGORIES: MutationCategory[] = ['transmission', 'symptom', 'ability', 'evasion', 'lethality'];

export function MutationTree({ onClose }: Props) {
  const dna = useGameStore((s) => s.dnaPoints);
  const pathogen = useGameStore((s) => s.pathogen);
  const buy = useGameStore((s) => s.buyMutationAction);

  return (
    <div
      data-testid="mutation-tree-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-6xl overflow-hidden rounded-xl border border-plague-700 bg-ink-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-ink-700 bg-plague-900/30 px-4 py-3">
          <div>
            <h2 className="font-mono text-lg font-bold text-plague-300 glow-red">Pathogen Evolution</h2>
            <p className="text-xs text-ink-300">Spend DNA to add mutations. Prerequisites must be met.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-plague-100">
              DNA <span className="font-bold" data-testid="dna-balance">{dna.toFixed(0)}</span>
            </div>
            <button
              onClick={onClose}
              data-testid="close-mutations"
              className="rounded bg-ink-700 px-3 py-1 text-sm text-ink-100 hover:bg-ink-600"
            >
              Close
            </button>
          </div>
        </header>

        <div className="grid max-h-[calc(85vh-80px)] grid-cols-4 gap-3 overflow-y-auto p-4 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="rounded-lg border border-ink-700 bg-ink-700/30 p-2">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-plague-300">
                {CATEGORY_TITLES[cat]}
              </h3>
              <div className="flex flex-col gap-2">
                {MUTATIONS.filter((m) => m.category === cat).map((m) => (
                  <MutationNode key={m.id} mutation={m} dna={dna} pathogen={pathogen} onBuy={buy} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MutationNode({
  mutation,
  dna,
  pathogen,
  onBuy,
}: {
  mutation: Mutation;
  dna: number;
  pathogen: ReturnType<typeof useGameStore.getState>['pathogen'];
  onBuy: (id: string) => void;
}) {
  const owned = pathogen.mutations.has(mutation.id);
  const prereqsMet = mutation.prereqs.every((id) => pathogen.mutations.has(id));
  const canAfford = dna >= mutation.cost;
  const canBuy = !owned && prereqsMet && canAfford;

  const stateClass = owned
    ? 'border-emerald-500/70 bg-emerald-900/30'
    : !prereqsMet
      ? 'border-ink-700 bg-ink-800/50 opacity-50'
      : canAfford
        ? 'border-plague-500 bg-plague-900/40 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
        : 'border-ink-600 bg-ink-700/40';

  return (
    <button
      data-testid={`mutation-${mutation.id}`}
      onClick={() => canBuy && onBuy(mutation.id)}
      disabled={!canBuy}
      className={`rounded-md border p-2 text-left text-xs transition ${stateClass} ${
        canBuy ? 'cursor-pointer hover:bg-plague-900/60' : 'cursor-not-allowed'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-plague-100">{mutation.name}</span>
        <span className={`text-xs ${owned ? 'text-emerald-300' : 'text-plague-300'}`}>
          {owned ? '✓' : `${mutation.cost} DNA`}
        </span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-ink-300">{mutation.description}</p>
      {mutation.prereqs.length > 0 && (
        <p className="mt-1 text-[10px] text-ink-300">
          Requires: {mutation.prereqs.join(', ')}
        </p>
      )}
    </button>
  );
}
