class ArcadeSoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled = true;
  private musicEnabled = true;
  private musicTimer: number | null = null;
  private musicStep = 0;

  public setSfxEnabled(val: boolean): void {
    this.sfxEnabled = val;
  }

  public setMusicEnabled(val: boolean): void {
    this.musicEnabled = val;
    if (!val) {
      this.stopMusic();
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    startDelay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + startDelay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public startMusic(): void {
    if (!this.musicEnabled || this.musicTimer !== null) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const melody = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33];
    const bass = [130.81, 130.81, 174.61, 174.61, 196.0, 196.0, 146.83, 196.0];

    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const idx = this.musicStep % melody.length;
      this.playTone(melody[idx], 0.15, 'triangle', 0.026, 0);
      this.playTone(bass[idx], 0.2, 'sine', 0.03, 0);
      this.musicStep += 1;
    }, 310);
  }

  public stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public playCountdown(isGo: boolean): void {
    if (!this.sfxEnabled) return;
    if (isGo) {
      // Referee whistle effect for "TARIK!"
      this.playWhistle();
    } else {
      this.playTone(440, 0.12, 'triangle', 0.14, 0);
    }
  }

  public playWhistle(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2650, now);
    lfo.frequency.setValueAtTime(38, now);
    lfoGain.gain.setValueAtTime(140, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.03);
    gain.gain.setValueAtTime(0.14, now + 0.32);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.47);
    lfo.stop(now + 0.47);
  }

  public playBoing(): void {
    if (!this.sfxEnabled) return;
    this.playTone(520, 0.07, 'sine', 0.1, 0);
    this.playTone(760, 0.09, 'sine', 0.09, 0.05);
  }

  public playTimerTick(): void {
    if (!this.sfxEnabled) return;
    this.playTone(920, 0.045, 'square', 0.045, 0);
  }

  public playCorrect(): void {
    if (!this.sfxEnabled) return;
    this.playTone(659.25, 0.1, 'sine', 0.16, 0);
    this.playTone(880.0, 0.18, 'triangle', 0.17, 0.07);
    this.playTone(1046.5, 0.2, 'sine', 0.13, 0.14);
  }

  public playWrong(): void {
    if (!this.sfxEnabled) return;
    this.playTone(210, 0.14, 'sawtooth', 0.1, 0);
    this.playTone(155, 0.22, 'sawtooth', 0.1, 0.12);
  }

  public playRopePull(): void {
    if (!this.sfxEnabled) return;
    this.playTone(340, 0.08, 'triangle', 0.1, 0);
    this.playTone(500, 0.1, 'triangle', 0.1, 0.05);
  }

  public playVictory(): void {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.24, 'triangle', 0.17, idx * 0.1);
    });
  }
}

export const soundEngine = new ArcadeSoundEngine();
