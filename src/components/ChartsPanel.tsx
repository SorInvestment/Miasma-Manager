import { useGameStore } from '../state/gameStore';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface Props {
  onClose: () => void;
}

function compactNumber(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

export function ChartsPanel({ onClose }: Props) {
  const history = useGameStore((s) => s.history);
  const sample = history.length > 200 ? history.filter((_, i) => i % Math.ceil(history.length / 200) === 0) : history;

  return (
    <div
      data-testid="charts-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-ink-700 bg-ink-900 px-4 py-3">
          <h2 className="font-mono text-lg font-bold text-ink-100">Epidemic Curves</h2>
          <button
            onClick={onClose}
            data-testid="close-charts"
            className="rounded bg-ink-700 px-3 py-1 text-sm hover:bg-ink-600"
          >
            Close
          </button>
        </header>
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
          <div className="h-72 rounded-lg border border-ink-700 bg-ink-700/30 p-3">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-300">SEIR Compartments</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sample}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" />
                <XAxis dataKey="day" stroke="#7c8aa8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#7c8aa8" tick={{ fontSize: 10 }} tickFormatter={compactNumber} />
                <Tooltip
                  contentStyle={{ background: '#101524', border: '1px solid #2a3550', fontSize: 12 }}
                  formatter={(value: number) => compactNumber(value)}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="S" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Area type="monotone" dataKey="E" stackId="1" stroke="#fde68a" fill="#fde68a" fillOpacity={0.5} />
                <Area type="monotone" dataKey="I" stackId="1" stroke="#fb923c" fill="#fb923c" fillOpacity={0.6} />
                <Area type="monotone" dataKey="R" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                <Area type="monotone" dataKey="D" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-72 rounded-lg border border-ink-700 bg-ink-700/30 p-3">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-300">Cure Progress</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sample}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" />
                <XAxis dataKey="day" stroke="#7c8aa8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#7c8aa8" tick={{ fontSize: 10 }} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ background: '#101524', border: '1px solid #2a3550', fontSize: 12 }}
                  formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                />
                <Line type="monotone" dataKey="cure" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
