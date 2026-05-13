import { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { useSettingsStore } from '../state/settingsStore';

const LEGACY_STORAGE_KEY = 'miasma-tutorial-seen';

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to Miasma Manager',
    body:
      'The clock at the top advances days. Use the speed buttons (1×–5×) to set the pace, or pause with ⏸. A typical game runs 15–25 minutes at 1×. Press the ☰ button (top right) or Esc for the in-game menu.',
  },
  {
    title: 'The world: cities and countries',
    body:
      'The map shows ~180 major metros across ~196 countries. Cities are SEIR units; countries aggregate them. Each country has wealth, healthcare capacity, government type, drug-resistance — visible in the country panel on the right.',
  },
  {
    title: 'Mutations and the strain tree',
    body:
      'Pathogen mode: spend DNA on five branches — Transmission, Symptoms, Abilities, Evasion, Lethality. Evasion mutations can fork new strains that compete for hosts and roll back the cure.',
  },
  {
    title: 'Cure, compliance, panic',
    body:
      'Top bar shows the 4-stage cure (Sequencing → Vaccine R&D → Trials → Distribution). The Comply bar tracks public compliance. Each country has its own panic level and can collapse when healthcare runs out — collapsed countries get a red pulsing ring on the map.',
  },
  {
    title: 'News & borders',
    body:
      'The news ticker (just below the top bar) scrolls country-tagged events: outbreaks, border closures, mass graves. Authoritarian countries auto-close borders fast; democracies wait for panic to rise. Closed borders dampen international spread.',
  },
];

export function TutorialOverlay() {
  const phase = useGameStore((s) => s.phase);
  const tutorialSeen = useSettingsStore((s) => s.tutorialSeen);
  const setTutorialSeen = useSettingsStore((s) => s.setTutorialSeen);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const legacy = window.localStorage?.getItem(LEGACY_STORAGE_KEY);
    if (legacy && !tutorialSeen) {
      setTutorialSeen(true);
      try {
        window.localStorage?.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, [tutorialSeen, setTutorialSeen]);

  useEffect(() => {
    if (phase !== 'playing') {
      setOpen(false);
      return;
    }
    if (!tutorialSeen) {
      setOpen(true);
      setStep(0);
    }
  }, [phase, tutorialSeen]);

  if (!open) return null;

  function dismiss() {
    setTutorialSeen(true);
    setOpen(false);
  }

  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      data-testid="tutorial-overlay"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur"
    >
      <div className="max-w-lg rounded-xl border border-plague-500/40 bg-ink-800 p-6 shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-wider text-plague-300">
          Tutorial {step + 1} / {STEPS.length}
        </p>
        <h3 className="mb-3 font-mono text-2xl font-bold text-plague-100">{current.title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-ink-100">{current.body}</p>
        <div className="flex items-center justify-between">
          <button
            data-testid="tutorial-skip"
            onClick={dismiss}
            className="rounded border border-ink-600 px-3 py-1.5 text-xs text-ink-300 hover:bg-ink-700"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded bg-ink-700 px-3 py-1.5 text-xs hover:bg-ink-600"
              >
                Back
              </button>
            )}
            <button
              data-testid="tutorial-next"
              onClick={() => (last ? dismiss() : setStep(step + 1))}
              className="rounded bg-plague-500 px-4 py-1.5 text-sm font-bold text-ink-900 hover:bg-plague-300"
            >
              {last ? 'Begin' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
