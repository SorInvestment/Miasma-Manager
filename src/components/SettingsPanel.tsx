import { useGameStore } from '../state/gameStore';
import { useSettingsStore } from '../state/settingsStore';
import { useScoresStore } from '../state/scoresStore';
import type { Difficulty } from '../sim/types';
import { DIFFICULTY_LIST, DIFFICULTY_LABELS } from '../sim/difficulty';

interface Props {
  standalone?: boolean;
  onClose?: () => void;
}

export function SettingsPanel({ standalone, onClose }: Props) {
  const settings = useSettingsStore();
  const goToPhase = useGameStore((s) => s.goToPhase);
  const resetScores = useScoresStore((s) => s.resetScores);
  const totalGames = useScoresStore((s) => s.totalGames);

  const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (standalone) {
      return (
        <div className="flex h-screen flex-col overflow-auto bg-gradient-to-b from-ink-900 via-ink-800 to-ink-900 p-6 text-ink-100">
          <div className="mx-auto w-full max-w-2xl">
            <button
              data-testid="back-to-menu"
              onClick={() => goToPhase('menu')}
              className="mb-4 font-mono text-xs uppercase tracking-widest text-ink-300 hover:text-plague-300"
            >
              ← Main menu
            </button>
            <h1 className="mb-6 font-mono text-3xl font-bold text-plague-500 glow-red">SETTINGS</h1>
            {children}
          </div>
        </div>
      );
    }
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-ink-700 bg-ink-800 p-6 text-ink-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-2xl font-bold text-plague-500">SETTINGS</h2>
            <button
              data-testid="close-settings"
              onClick={onClose}
              className="rounded bg-ink-700 px-3 py-1 text-sm hover:bg-ink-600"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <Container>
      <section className="mb-6 space-y-4">
        <SectionTitle>Audio</SectionTitle>
        <ToggleRow
          label="Mute everything"
          testId="setting-muted"
          value={settings.muted}
          onChange={() => settings.toggleMute()}
        />
        <VolumeRow
          label="Master volume"
          testId="setting-master"
          value={settings.masterVolume}
          onChange={(v) => settings.setVolume('master', v)}
          disabled={settings.muted}
        />
        <VolumeRow
          label="Music"
          testId="setting-music"
          value={settings.musicVolume}
          onChange={(v) => settings.setVolume('music', v)}
          disabled={settings.muted}
        />
        <VolumeRow
          label="SFX"
          testId="setting-sfx"
          value={settings.sfxVolume}
          onChange={(v) => settings.setVolume('sfx', v)}
          disabled={settings.muted}
        />
      </section>

      <section className="mb-6 space-y-4">
        <SectionTitle>Display</SectionTitle>
        <ToggleRow
          label="Reduce motion (no marquee animation)"
          testId="setting-reduced-motion"
          value={settings.reducedMotion}
          onChange={() => settings.setReducedMotion(!settings.reducedMotion)}
        />
        <ToggleRow
          label="Show advanced stats in HUD"
          testId="setting-advanced-stats"
          value={settings.showAdvancedStats}
          onChange={() => settings.setShowAdvancedStats(!settings.showAdvancedStats)}
        />
        <SelectRow
          label="News ticker speed"
          testId="setting-ticker-speed"
          value={settings.newsTickerSpeed}
          options={[
            { id: 'slow', label: 'Slow' },
            { id: 'normal', label: 'Normal' },
            { id: 'fast', label: 'Fast' },
          ]}
          onChange={(v) => settings.setNewsTickerSpeed(v as 'slow' | 'normal' | 'fast')}
        />
      </section>

      <section className="mb-6 space-y-4">
        <SectionTitle>Gameplay</SectionTitle>
        <SelectRow
          label="Default difficulty"
          testId="setting-default-diff"
          value={settings.difficultyDefault}
          options={DIFFICULTY_LIST.map((d) => ({ id: d, label: DIFFICULTY_LABELS[d] }))}
          onChange={(v) => settings.setDifficultyDefault(v as Difficulty)}
        />
        <button
          data-testid="reset-tutorial"
          onClick={() => settings.resetTutorial()}
          className="rounded-md border border-ink-600 bg-ink-700 px-4 py-2 text-sm hover:border-plague-500"
        >
          Replay tutorial on next game
        </button>
      </section>

      <section className="mb-6 space-y-4">
        <SectionTitle>Data</SectionTitle>
        <p className="text-xs text-ink-300">
          {totalGames > 0 ? `${totalGames} games played` : 'No games played yet'}
        </p>
        <button
          data-testid="reset-scores"
          onClick={() => {
            if (confirm('Clear all best scores? This cannot be undone.')) resetScores();
          }}
          className="rounded-md border border-plague-700 bg-plague-900/40 px-4 py-2 text-sm text-plague-100 hover:bg-plague-700/60"
        >
          Clear all best scores
        </button>
        <button
          data-testid="reset-all-settings"
          onClick={() => settings.resetAll()}
          className="ml-2 rounded-md border border-ink-600 bg-ink-700 px-4 py-2 text-sm hover:border-plague-500"
        >
          Reset settings to defaults
        </button>
      </section>
    </Container>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-ink-700 pb-1 font-mono text-xs uppercase tracking-[0.3em] text-ink-300">
      {children}
    </h3>
  );
}

function ToggleRow({
  label,
  testId,
  value,
  onChange,
}: {
  label: string;
  testId: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink-100">{label}</span>
      <input
        type="checkbox"
        checked={value}
        data-testid={testId}
        onChange={onChange}
        className="h-5 w-5 accent-plague-500"
      />
    </label>
  );
}

function VolumeRow({
  label,
  testId,
  value,
  onChange,
  disabled,
}: {
  label: string;
  testId: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink-100">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value}
          data-testid={testId}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-44 accent-plague-500"
        />
        <span className="w-10 text-right font-mono text-xs text-ink-300">
          {Math.round(value * 100)}%
        </span>
      </div>
    </label>
  );
}

function SelectRow({
  label,
  testId,
  value,
  options,
  onChange,
}: {
  label: string;
  testId: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink-100">{label}</span>
      <select
        value={value}
        data-testid={testId}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-ink-600 bg-ink-700 px-3 py-1 text-sm text-ink-100"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
