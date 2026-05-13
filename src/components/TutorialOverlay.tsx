import { useState, useEffect } from 'react';

const STORAGE_KEY = 'miasma-tutorial-seen';
const TUTORIAL_VERSION = 'v2';

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to Miasma Manager',
    body:
      'The clock at the top advances days. Use the speed buttons (1×–5×) to set the pace, or pause with ⏸. Your goal depends on your side: as the Pathogen, kill enough to topple humanity before the cure ships. As the Defender, ship the cure (or contain spread) before the death limit.',
  },
  {
    title: 'Mutations and the strain tree',
    body:
      'Pathogen mode: spend DNA to unlock mutations across five branches — Transmission, Symptoms, Abilities, Evasion, and Lethality. Evasion mutations spawn new strains that compete for hosts and can roll back vaccine progress. Watch your strains in the SidePanel.',
  },
  {
    title: 'The 4-stage cure & compliance',
    body:
      'The top bar shows four segments: Sequencing → Vaccine R&D → Trials → Distribution. Each stage advances based on different inputs and can be funded by the defender. The yellow Comply bar tracks public compliance — too many lockdowns or hostile mutations drop it, and lockdowns get weaker when low.',
  },
];

export function TutorialOverlay() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage?.getItem(STORAGE_KEY);
    if (seen !== TUTORIAL_VERSION) setOpen(true);
  }, []);

  if (!open) return null;

  function dismiss(remember: boolean) {
    if (remember && typeof window !== 'undefined') {
      window.localStorage?.setItem(STORAGE_KEY, TUTORIAL_VERSION);
    }
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
            onClick={() => dismiss(true)}
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
              onClick={() => (last ? dismiss(true) : setStep(step + 1))}
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
