import { useEffect, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { SettingsPanel } from './SettingsPanel';

interface Props {
  onClose: () => void;
}

export function PauseMenu({ onClose }: Props) {
  const setSpeed = useGameStore((s) => s.setSpeed);
  const resetGame = useGameStore((s) => s.resetGame);
  const goToPhase = useGameStore((s) => s.goToPhase);
  const prevSpeed = useGameStore.getState().speed;
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setSpeed(0);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, setSpeed]);

  if (showSettings) {
    return <SettingsPanel onClose={() => setShowSettings(false)} />;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80"
      onClick={onClose}
      data-testid="pause-menu"
    >
      <div
        className="w-full max-w-xs rounded-xl border border-ink-700 bg-ink-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-center font-mono text-2xl font-bold text-plague-500 glow-red">
          PAUSED
        </h2>
        <div className="space-y-2">
          <PauseButton
            label="Resume"
            testId="pause-resume"
            onClick={() => {
              setSpeed(prevSpeed || 1);
              onClose();
            }}
          />
          <PauseButton
            label="Settings"
            testId="pause-settings"
            onClick={() => setShowSettings(true)}
          />
          <PauseButton
            label="Restart Game"
            testId="pause-restart"
            onClick={() => {
              if (confirm('Restart this game? Progress will be lost.')) {
                resetGame();
                goToPhase('menu');
                onClose();
              }
            }}
          />
          <PauseButton
            label="Quit to Main Menu"
            testId="pause-quit"
            danger
            onClick={() => {
              if (confirm('Quit to main menu? Progress will be lost.')) {
                resetGame();
                goToPhase('menu');
                onClose();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function PauseButton({
  label,
  testId,
  onClick,
  danger,
}: {
  label: string;
  testId: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`w-full rounded-md border px-4 py-2 text-sm font-bold transition ${
        danger
          ? 'border-plague-700 bg-plague-900/40 text-plague-100 hover:bg-plague-700/60'
          : 'border-ink-600 bg-ink-700 text-ink-100 hover:border-plague-500 hover:bg-ink-600'
      }`}
    >
      {label}
    </button>
  );
}
