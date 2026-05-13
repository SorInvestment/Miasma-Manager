import { useMemo, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import type { GameEvent } from '../sim/types';

const SEVERITY_STYLE: Record<GameEvent['kind'], string> = {
  detection: 'text-amber-300',
  cure: 'text-emerald-300',
  mutation: 'text-plague-300',
  intervention: 'text-cyan-300',
  death: 'text-plague-500',
  system: 'text-ink-200',
  'world-event': 'text-orange-300',
};

const SEVERITY_BG: Record<GameEvent['kind'], string> = {
  detection: 'bg-amber-900/30 border-amber-700/40',
  cure: 'bg-emerald-900/30 border-emerald-700/40',
  mutation: 'bg-plague-900/30 border-plague-700/40',
  intervention: 'bg-cyan-900/30 border-cyan-700/40',
  death: 'bg-plague-900/40 border-plague-700/50',
  system: 'bg-ink-700/30 border-ink-600/40',
  'world-event': 'bg-orange-900/30 border-orange-700/40',
};

const TICKER_WINDOW_DAYS = 60;
const MAX_TICKER_ITEMS = 8;

export function NewsTicker() {
  const events = useGameStore((s) => s.events);
  const day = useGameStore((s) => s.day);
  const phase = useGameStore((s) => s.phase);
  const [paused, setPaused] = useState(false);
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const ticker = useMemo(() => {
    return events
      .filter(
        (e) =>
          (e.kind === 'world-event' || e.kind === 'detection' || e.kind === 'intervention') &&
          day - e.day <= TICKER_WINDOW_DAYS,
      )
      .slice(-MAX_TICKER_ITEMS)
      .reverse();
  }, [events, day]);

  if (phase !== 'playing' || ticker.length === 0) return null;

  const animation = paused || reducedMotion ? '' : 'animate-marquee';

  return (
    <section
      data-testid="news-ticker"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative flex h-7 items-center gap-2 overflow-hidden border-y border-ink-700 bg-ink-800/90 font-mono text-xs"
      aria-live="polite"
    >
      <span className="z-10 flex h-full shrink-0 items-center gap-1 bg-plague-700/70 px-2 font-bold uppercase tracking-wide text-ink-50">
        📰 News
      </span>
      <div className={`flex shrink-0 items-center gap-3 whitespace-nowrap pr-12 ${animation}`}>
        {ticker.map((e, idx) => (
          <span
            key={`${e.day}-${idx}`}
            className={`flex shrink-0 items-center gap-2 rounded border px-2 py-0.5 ${SEVERITY_BG[e.kind]}`}
          >
            <span className="text-ink-300">D{e.day}</span>
            <span className={SEVERITY_STYLE[e.kind]}>{e.text}</span>
          </span>
        ))}
        {!reducedMotion &&
          ticker.map((e, idx) => (
            <span
              key={`dup-${e.day}-${idx}`}
              className={`flex shrink-0 items-center gap-2 rounded border px-2 py-0.5 ${SEVERITY_BG[e.kind]}`}
              aria-hidden="true"
            >
              <span className="text-ink-300">D{e.day}</span>
              <span className={SEVERITY_STYLE[e.kind]}>{e.text}</span>
            </span>
          ))}
      </div>
    </section>
  );
}
