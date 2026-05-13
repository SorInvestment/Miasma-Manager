import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { useSettingsStore } from '../state/settingsStore';
import { AudioEngine, type SfxId } from '../audio/AudioEngine';

const MUSIC_FOR_PHASE: Partial<Record<string, 'menu' | 'calm' | 'tense' | 'collapse'>> = {
  menu: 'menu',
  scenarios: 'menu',
  settings: 'menu',
  start: 'menu',
  playing: 'calm',
  won: 'menu',
  lost: 'collapse',
};

export function useAudio() {
  const phase = useGameStore((s) => s.phase);
  const muted = useSettingsStore((s) => s.muted);
  const events = useGameStore((s) => s.events);
  const cities = useGameStore((s) => s.cities);
  const countries = useGameStore((s) => s.countries);
  const lastEventIndex = useRef(events.length);
  const [, forceUpdate] = useState(0);

  // Unlock on first user gesture
  useEffect(() => {
    const handler = () => {
      AudioEngine.get().unlock().then(() => forceUpdate((x) => x + 1));
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
    window.addEventListener('pointerdown', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
  }, []);

  // Music selection by phase + intensity
  useEffect(() => {
    const engine = AudioEngine.get();
    if (muted) {
      engine.stopMusic();
      return;
    }
    if (phase === 'playing') {
      const collapsedCount = countries ? Object.values(countries).filter((c) => c.collapsed).length : 0;
      let total = 0, infected = 0;
      for (const c of Object.values(cities)) {
        total += c.population;
        infected += c.E + c.I;
      }
      const ratio = total > 0 ? infected / total : 0;
      let track: 'calm' | 'tense' | 'collapse' = 'calm';
      if (collapsedCount >= 3 || ratio > 0.08) track = 'collapse';
      else if (ratio > 0.005 || collapsedCount > 0) track = 'tense';
      engine.playMusic(track);
    } else {
      const track = MUSIC_FOR_PHASE[phase] ?? 'menu';
      engine.playMusic(track);
    }
  }, [phase, muted, cities, countries]);

  // SFX in response to new events
  useEffect(() => {
    if (muted) return;
    if (events.length <= lastEventIndex.current) {
      lastEventIndex.current = events.length;
      return;
    }
    const newEvents = events.slice(lastEventIndex.current);
    lastEventIndex.current = events.length;
    const engine = AudioEngine.get();
    for (const ev of newEvents) {
      const sfx = sfxForEvent(ev.text, ev.kind);
      if (sfx) engine.playSfx(sfx);
    }
  }, [events, muted]);
}

function sfxForEvent(text: string, kind: string): SfxId | null {
  const t = text.toLowerCase();
  if (kind === 'detection') return 'detection';
  if (kind === 'mutation') return 'mutation';
  if (kind === 'intervention') return 'intervene';
  if (kind === 'cure') return 'cure-stage';
  if (t.includes('collapse') || t.includes('overflow') || t.includes('disintegrates')) return 'collapse';
  if (t.includes('burning') || t.includes('mass graves')) return 'collapse';
  return null;
}
