import { useState } from 'react';
import { useGameStore } from './state/gameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { useAudio } from './hooks/useAudio';
import { MainMenu } from './components/MainMenu';
import { ScenariosScreen } from './components/ScenariosScreen';
import { SettingsPanel } from './components/SettingsPanel';
import { StartScreen } from './components/StartScreen';
import { TopBar } from './components/TopBar';
import { WorldMap } from './components/WorldMap';
import { SidePanel } from './components/SidePanel';
import { EventLog } from './components/EventLog';
import { NewsTicker } from './components/NewsTicker';
import { MutationTree } from './components/MutationTree';
import { InterventionPanel } from './components/InterventionPanel';
import { ChartsPanel } from './components/ChartsPanel';
import { EndScreen } from './components/EndScreen';
import { TutorialOverlay } from './components/TutorialOverlay';
import { PauseMenu } from './components/PauseMenu';

type Modal = 'mutations' | 'interventions' | 'charts' | 'pause' | null;

export default function App() {
  useGameLoop();
  useAudio();
  const phase = useGameStore((s) => s.phase);
  const [modal, setModal] = useState<Modal>(null);

  if (phase === 'menu') return <MainMenu />;
  if (phase === 'scenarios') return <ScenariosScreen />;
  if (phase === 'settings') return <SettingsPanel standalone />;
  if (phase === 'start') return <StartScreen />;

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-ink-100">
      <TopBar onOpenCharts={() => setModal('charts')} onOpenPause={() => setModal('pause')} />
      <NewsTicker />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <WorldMap />
          </div>
          <EventLog />
        </main>
        <SidePanel
          onOpenMutations={() => setModal('mutations')}
          onOpenInterventions={() => setModal('interventions')}
          onOpenCharts={() => setModal('charts')}
        />
      </div>
      {modal === 'mutations' && <MutationTree onClose={() => setModal(null)} />}
      {modal === 'interventions' && <InterventionPanel onClose={() => setModal(null)} />}
      {modal === 'charts' && <ChartsPanel onClose={() => setModal(null)} />}
      {modal === 'pause' && <PauseMenu onClose={() => setModal(null)} />}
      {(phase === 'won' || phase === 'lost') && <EndScreen />}
      <TutorialOverlay />
    </div>
  );
}
