import { useGameStore } from '../state/gameStore';
import { useSettingsStore } from '../state/settingsStore';
import { useScoresStore } from '../state/scoresStore';

export function MainMenu() {
  const goToPhase = useGameStore((s) => s.goToPhase);
  const resetTutorial = useSettingsStore((s) => s.resetTutorial);
  const totalGames = useScoresStore((s) => s.totalGames);
  const totalWins = useScoresStore((s) => s.totalWins);

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-auto bg-gradient-to-br from-ink-900 via-plague-900/70 to-ink-900 p-6 text-ink-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.15),transparent_55%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_80%,rgba(127,29,29,0.25),transparent_60%)]" />

      <header className="mb-12 text-center">
        <h1 className="font-mono text-6xl font-black tracking-tight text-plague-500 glow-red sm:text-7xl">
          MIASMA
        </h1>
        <h1 className="font-mono text-4xl font-bold tracking-widest text-ink-100 sm:text-5xl">
          MANAGER
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.4em] text-ink-300">
          a scientifically-grounded plague simulation
        </p>
      </header>

      <nav className="flex w-full max-w-md flex-col gap-3">
        <MenuButton
          label="Play"
          subtitle="Quick sandbox start"
          accent
          onClick={() => goToPhase('start')}
          testId="menu-play"
        />
        <MenuButton
          label="Scenarios"
          subtitle="Curated outbreak campaigns"
          onClick={() => goToPhase('scenarios')}
          testId="menu-scenarios"
        />
        <MenuButton
          label="Settings"
          subtitle="Audio, motion, tutorial"
          onClick={() => goToPhase('settings')}
          testId="menu-settings"
        />
        <MenuButton
          label="How to Play"
          subtitle="Replay the tutorial"
          onClick={() => {
            resetTutorial();
            goToPhase('start');
          }}
          testId="menu-tutorial"
        />
      </nav>

      {totalGames > 0 && (
        <footer className="mt-10 font-mono text-xs text-ink-300">
          Career: {totalWins}/{totalGames} wins
        </footer>
      )}
    </div>
  );
}

function MenuButton({
  label,
  subtitle,
  accent,
  onClick,
  testId,
}: {
  label: string;
  subtitle: string;
  accent?: boolean;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-md border px-5 py-4 text-left transition-all active:scale-[0.99] ${
        accent
          ? 'border-plague-500 bg-plague-700/50 hover:bg-plague-700/70'
          : 'border-ink-600 bg-ink-800/60 hover:border-plague-500 hover:bg-ink-700/70'
      }`}
    >
      <div className="font-mono text-2xl font-bold tracking-wide">{label}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wider text-ink-300">{subtitle}</div>
    </button>
  );
}
