import { useMemo, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import type { CountryState } from '../sim/types';

type SortKey = 'deaths' | 'infected' | 'panic' | 'collapsed';

const SORT_LABELS: Record<SortKey, string> = {
  deaths: 'Dead',
  infected: 'Infected',
  panic: 'Panic',
  collapsed: 'Collapse',
};

function format(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

export function CountryList({ limit = 10 }: { limit?: number }) {
  const countries = useGameStore((s) => s.countries);
  const selectedCountryCode = useGameStore((s) => s.selectedCountryCode);
  const selectCountry = useGameStore((s) => s.selectCountry);
  const [sortKey, setSortKey] = useState<SortKey>('infected');

  const sorted = useMemo(() => {
    if (!countries) return [] as CountryState[];
    const list = Object.values(countries);
    const sorters: Record<SortKey, (a: CountryState, b: CountryState) => number> = {
      deaths: (a, b) => b.D - a.D,
      infected: (a, b) => b.E + b.I - (a.E + a.I),
      panic: (a, b) => b.panicLevel - a.panicLevel,
      collapsed: (a, b) =>
        (b.collapsed ? 1 : 0) - (a.collapsed ? 1 : 0) || b.D - a.D,
    };
    return list
      .filter((c) => c.D > 0 || c.E + c.I > 0 || c.detected || c.collapsed)
      .sort(sorters[sortKey])
      .slice(0, limit);
  }, [countries, sortKey, limit]);

  if (!countries || sorted.length === 0) {
    return (
      <section
        data-testid="country-list-empty"
        className="rounded-md border border-ink-700 bg-ink-700/40 p-3 text-xs text-ink-300"
      >
        <h3 className="mb-1 font-bold uppercase tracking-wider">Countries</h3>
        No country activity yet.
      </section>
    );
  }

  return (
    <section
      data-testid="country-list"
      className="rounded-md border border-ink-700 bg-ink-700/40 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-300">Countries</h3>
        <div className="flex gap-1" role="group" aria-label="Sort countries">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider transition ${
                sortKey === k
                  ? 'bg-plague-500 text-ink-900'
                  : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
              }`}
            >
              {SORT_LABELS[k]}
            </button>
          ))}
        </div>
      </div>
      <ul className="space-y-1">
        {sorted.map((c) => {
          const active = selectedCountryCode === c.code;
          return (
            <li key={c.code}>
              <button
                data-testid={`country-row-${c.code}`}
                onClick={() => selectCountry(active ? null : c.code)}
                className={`flex w-full items-center justify-between rounded border px-2 py-1 text-left text-xs transition ${
                  active
                    ? 'border-plague-500 bg-plague-900/40'
                    : 'border-transparent hover:border-ink-600 hover:bg-ink-700/50'
                }`}
              >
                <span className="flex flex-1 items-center gap-2 truncate">
                  <span aria-hidden="true">{c.flagEmoji}</span>
                  <span className="truncate text-ink-100">{c.name}</span>
                  {c.collapsed && (
                    <span className="rounded bg-plague-700 px-1 text-[9px] text-plague-50">
                      COLLAPSE
                    </span>
                  )}
                  {c.borderPolicy === 'closed' && (
                    <span className="rounded bg-ink-600 px-1 text-[9px] text-amber-200">
                      BORDER
                    </span>
                  )}
                </span>
                <span className="ml-2 tabular-nums text-ink-300">
                  {sortKey === 'panic'
                    ? `${Math.round(c.panicLevel * 100)}%`
                    : sortKey === 'deaths'
                    ? format(c.D)
                    : format(c.E + c.I)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
