class FeedbackService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (enabled && this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  private resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.ctx || !this.soundEnabled) return;
    this.resumeContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // --- Sound Effects ---

  playClick() {
    this.playTone(800, 'sine', 0.05, 0.05);
  }

  playSuccess() {
    this.playTone(880, 'sine', 0.1, 0.1); // A5
    setTimeout(() => this.playTone(1108, 'sine', 0.2, 0.1), 100); // C#6
  }

  playError() {
    this.playTone(150, 'sawtooth', 0.2, 0.1);
    if (this.hapticsEnabled && navigator.vibrate) navigator.vibrate(200);
  }

  playCash() {
    this.playTone(1200, 'square', 0.1, 0.05);
    setTimeout(() => this.playTone(1600, 'square', 0.2, 0.05), 50);
  }

  playBattleStart() {
    this.playTone(100, 'sawtooth', 0.5, 0.2);
    setTimeout(() => this.playTone(80, 'sawtooth', 0.5, 0.2), 200);
  }

  playHit() {
    this.playTone(200, 'square', 0.1, 0.1);
    if (this.hapticsEnabled && navigator.vibrate) navigator.vibrate(50);
  }

  playCrit() {
    this.playTone(400, 'sawtooth', 0.3, 0.2);
    if (this.hapticsEnabled && navigator.vibrate) navigator.vibrate([50, 50, 50]);
  }
}

export const feedbackService = new FeedbackService();