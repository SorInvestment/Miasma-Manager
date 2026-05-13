import { useSettingsStore } from '../state/settingsStore';

export type MusicTrackId = 'menu' | 'calm' | 'tense' | 'collapse';
export type SfxId =
  | 'click'
  | 'hover'
  | 'detection'
  | 'mutation'
  | 'intervene'
  | 'cure-stage'
  | 'collapse'
  | 'victory'
  | 'defeat';

interface MusicTrack {
  source: AudioBufferSourceNode;
  gain: GainNode;
  buffer: AudioBuffer;
  startedAt: number;
}

const MUSIC_FILES: Record<MusicTrackId, string> = {
  menu: '/audio/music/menu.ogg',
  calm: '/audio/music/calm.ogg',
  tense: '/audio/music/tense.ogg',
  collapse: '/audio/music/collapse.ogg',
};

const SFX_FILES: Record<SfxId, string> = {
  click: '/audio/sfx/click.ogg',
  hover: '/audio/sfx/hover.ogg',
  detection: '/audio/sfx/detection.ogg',
  mutation: '/audio/sfx/mutation.ogg',
  intervene: '/audio/sfx/intervene.ogg',
  'cure-stage': '/audio/sfx/cure-stage.ogg',
  collapse: '/audio/sfx/collapse.ogg',
  victory: '/audio/sfx/victory.ogg',
  defeat: '/audio/sfx/defeat.ogg',
};

let instance: AudioEngine | null = null;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentMusic: MusicTrack | null = null;
  private currentTrackId: MusicTrackId | null = null;
  private musicBuffers = new Map<MusicTrackId, AudioBuffer | 'missing'>();
  private sfxBuffers = new Map<SfxId, AudioBuffer | 'missing'>();
  private autoplayBlocked = true;
  private unsubscribe: (() => void) | null = null;

  static get(): AudioEngine {
    if (!instance) instance = new AudioEngine();
    return instance;
  }

  /** Lazy-init in response to user gesture. Browsers block AudioContext before then. */
  async unlock(): Promise<void> {
    if (this.ctx) return;
    try {
      const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.autoplayBlocked = false;
      this.applySettings();
      this.unsubscribe = useSettingsStore.subscribe(() => this.applySettings());
    } catch {
      this.autoplayBlocked = true;
    }
  }

  isAutoplayBlocked(): boolean {
    return this.autoplayBlocked;
  }

  private applySettings(): void {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain) return;
    const s = useSettingsStore.getState();
    const master = s.muted ? 0 : s.masterVolume;
    this.masterGain.gain.setTargetAtTime(master, this.ctx.currentTime, 0.05);
    this.musicGain.gain.setTargetAtTime(s.musicVolume, this.ctx.currentTime, 0.05);
    this.sfxGain.gain.setTargetAtTime(s.sfxVolume, this.ctx.currentTime, 0.05);
  }

  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.arrayBuffer();
      return await this.ctx.decodeAudioData(data);
    } catch {
      return null;
    }
  }

  async playMusic(id: MusicTrackId): Promise<void> {
    if (!this.ctx || !this.musicGain) return;
    if (this.currentTrackId === id && this.currentMusic) return;

    let buf = this.musicBuffers.get(id);
    if (!buf) {
      const loaded = await this.loadBuffer(MUSIC_FILES[id]);
      buf = loaded ?? 'missing';
      this.musicBuffers.set(id, buf);
    }
    this.stopMusic();

    if (buf === 'missing') {
      this.playProceduralDrone(id);
      this.currentTrackId = id;
      return;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 1.2);
    source.connect(gain);
    gain.connect(this.musicGain);
    source.start();
    this.currentMusic = { source, gain, buffer: buf, startedAt: this.ctx.currentTime };
    this.currentTrackId = id;
  }

  private proceduralNodes: { osc: OscillatorNode; gain: GainNode; lfo?: OscillatorNode }[] = [];

  private playProceduralDrone(trackId: MusicTrackId): void {
    if (!this.ctx || !this.musicGain) return;
    this.stopProceduralDrone();

    const baseFreq = trackId === 'menu' ? 110 : trackId === 'calm' ? 87 : trackId === 'tense' ? 65 : 55;
    const detunes = trackId === 'collapse' ? [0, -8, 11, -23] : [0, 7, -4];

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = trackId === 'collapse' ? 8 : 3;
    filter.frequency.value = trackId === 'calm' ? 700 : trackId === 'tense' ? 480 : 350;

    const out = this.ctx.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 2.0);
    filter.connect(out);
    out.connect(this.musicGain);

    for (const detune of detunes) {
      const osc = this.ctx.createOscillator();
      osc.type = trackId === 'collapse' ? 'sawtooth' : 'triangle';
      osc.frequency.value = baseFreq;
      osc.detune.value = detune * 10;
      osc.connect(filter);
      osc.start();
      this.proceduralNodes.push({ osc, gain: out });
    }

    if (trackId === 'tense' || trackId === 'collapse') {
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = trackId === 'collapse' ? 0.4 : 0.12;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = trackId === 'collapse' ? 200 : 80;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.proceduralNodes.push({ osc: lfo, gain: lfoGain });
    }
  }

  private stopProceduralDrone(): void {
    if (!this.ctx) return;
    for (const node of this.proceduralNodes) {
      try {
        node.osc.stop(this.ctx.currentTime + 0.3);
      } catch {
        /* already stopped */
      }
    }
    this.proceduralNodes = [];
  }

  stopMusic(): void {
    if (!this.ctx) return;
    if (this.currentMusic) {
      try {
        this.currentMusic.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
        this.currentMusic.source.stop(this.ctx.currentTime + 0.5);
      } catch {
        /* already stopped */
      }
      this.currentMusic = null;
    }
    this.stopProceduralDrone();
    this.currentTrackId = null;
  }

  async playSfx(id: SfxId): Promise<void> {
    if (!this.ctx || !this.sfxGain) return;
    let buf = this.sfxBuffers.get(id);
    if (!buf) {
      const loaded = await this.loadBuffer(SFX_FILES[id]);
      buf = loaded ?? 'missing';
      this.sfxBuffers.set(id, buf);
    }

    if (buf === 'missing') {
      this.playProceduralSfx(id);
      return;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = 1;
    src.connect(g);
    g.connect(this.sfxGain);
    src.start();
  }

  private playProceduralSfx(id: SfxId): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain);

    const presets: Record<SfxId, { freq: number; type: OscillatorType; duration: number; ramp?: number }> = {
      click: { freq: 880, type: 'square', duration: 0.04 },
      hover: { freq: 620, type: 'sine', duration: 0.06 },
      detection: { freq: 440, type: 'sawtooth', duration: 0.25, ramp: 880 },
      mutation: { freq: 200, type: 'sine', duration: 0.4, ramp: 660 },
      intervene: { freq: 330, type: 'triangle', duration: 0.15 },
      'cure-stage': { freq: 880, type: 'sine', duration: 0.35, ramp: 1320 },
      collapse: { freq: 110, type: 'sawtooth', duration: 0.9, ramp: 40 },
      victory: { freq: 523, type: 'sine', duration: 1.0, ramp: 1046 },
      defeat: { freq: 220, type: 'sine', duration: 1.2, ramp: 80 },
    };

    const preset = presets[id];
    osc.type = preset.type;
    osc.frequency.setValueAtTime(preset.freq, now);
    if (preset.ramp !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(preset.ramp, now + preset.duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);
    osc.start(now);
    osc.stop(now + preset.duration + 0.05);
  }

  dispose(): void {
    this.unsubscribe?.();
    this.stopMusic();
    this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    instance = null;
  }
}
