import { useGameStore } from '../state/gameStore';
import type { GameEvent } from '../sim/types';

const KIND_COLORS: Record<GameEvent['kind'], string> = {
  detection: 'text-amber-300',
  cure: 'text-emerald-300',
  mutation: 'text-plague-300',
  intervention: 'text-cyan-300',
  death: 'text-plague-500',
  system: 'text-ink-100',
  'world-event': 'text-orange-300',
};

export function EventLog() {
  const events = useGameStore((s) => s.events);
  const day = useGameStore((s) => s.day);
  const recent = events.slice(-30).reverse();
  const latestWorldEvent = [...events].reverse().find((e) => e.kind === 'world-event');
  const showTicker = latestWorldEvent && day - latestWorldEvent.day < 30;

  return (
    <section
      data-testid="event-log"
      className="overflow-y-auto border-t border-ink-700 bg-ink-800/80 font-mono text-xs scrollbar-thin"
    >
      {showTicker && (
        <div
          data-testid="news-ticker"
          className="border-b border-orange-700/40 bg-orange-900/20 px-3 py-1 text-orange-200"
        >
          📰 <span className="text-ink-300">Day {latestWorldEvent!.day}:</span>{' '}
          {latestWorldEvent!.text}
        </div>
      )}
      <div className="h-24 overflow-y-auto px-3 py-2">
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
      </div>
    </section>
  );
}
