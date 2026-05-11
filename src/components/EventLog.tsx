import { useGameStore } from '../state/gameStore';
import type { GameEvent } from '../sim/types';

const KIND_COLORS: Record<GameEvent['kind'], string> = {
  detection: 'text-amber-300',
  cure: 'text-emerald-300',
  mutation: 'text-plague-300',
  intervention: 'text-cyan-300',
  death: 'text-plague-500',
  system: 'text-ink-100',
};

export function EventLog() {
  const events = useGameStore((s) => s.events);
  const recent = events.slice(-30).reverse();

  return (
    <section
      data-testid="event-log"
      className="h-28 overflow-y-auto border-t border-ink-700 bg-ink-800/80 px-3 py-2 font-mono text-xs scrollbar-thin"
    >
      {recent.length === 0 ? (
        <div className="text-ink-300">No events yet.</div>
      ) : (
        <ul className="space-y-0.5">
          {recent.map((e, idx) => (
            <li key={`${e.day}-${idx}`}>
              <span className="text-ink-300">Day {e.day}:</span>{' '}
              <span className={KIND_COLORS[e.kind]}>{e.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
