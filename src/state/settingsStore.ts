import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty } from '../sim/types';

export interface SettingsState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  reducedMotion: boolean;
  newsTickerSpeed: 'slow' | 'normal' | 'fast';
  tutorialSeen: boolean;
  showAdvancedStats: boolean;
  difficultyDefault: Difficulty;
  version: 1;
}

interface SettingsActions {
  setVolume: (k: 'master' | 'music' | 'sfx', v: number) => void;
  toggleMute: () => void;
  setMuted: (m: boolean) => void;
  setReducedMotion: (r: boolean) => void;
  setNewsTickerSpeed: (s: SettingsState['newsTickerSpeed']) => void;
  setTutorialSeen: (b: boolean) => void;
  resetTutorial: () => void;
  setShowAdvancedStats: (b: boolean) => void;
  setDifficultyDefault: (d: Difficulty) => void;
  resetAll: () => void;
}

const initial: SettingsState = {
  masterVolume: 0.7,
  musicVolume: 0.6,
  sfxVolume: 0.85,
  muted: false,
  reducedMotion: false,
  newsTickerSpeed: 'normal',
  tutorialSeen: false,
  showAdvancedStats: false,
  difficultyDefault: 'normal',
  version: 1,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initial,
      setVolume: (k, v) =>
        set((s) =>
          k === 'master'
            ? { ...s, masterVolume: clamp01(v) }
            : k === 'music'
            ? { ...s, musicVolume: clamp01(v) }
            : { ...s, sfxVolume: clamp01(v) },
        ),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setMuted: (m) => set({ muted: m }),
      setReducedMotion: (r) => set({ reducedMotion: r }),
      setNewsTickerSpeed: (s) => set({ newsTickerSpeed: s }),
      setTutorialSeen: (b) => set({ tutorialSeen: b }),
      resetTutorial: () => set({ tutorialSeen: false }),
      setShowAdvancedStats: (b) => set({ showAdvancedStats: b }),
      setDifficultyDefault: (d) => set({ difficultyDefault: d }),
      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'miasma-settings',
      version: 1,
      partialize: (s) => ({
        masterVolume: s.masterVolume,
        musicVolume: s.musicVolume,
        sfxVolume: s.sfxVolume,
        muted: s.muted,
        reducedMotion: s.reducedMotion,
        newsTickerSpeed: s.newsTickerSpeed,
        tutorialSeen: s.tutorialSeen,
        showAdvancedStats: s.showAdvancedStats,
        difficultyDefault: s.difficultyDefault,
        version: s.version,
      }),
    },
  ),
);
