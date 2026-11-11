/**
 * Web Audio API Generative Sound Engine
 * Zero external audio files required! Generates lush ambient celestial pads,
 * spatial frequency shifts synced to scroll velocity, and tactile UI micro-chimes.
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = true;

    // Nodes
    this.masterGain = null;
    this.droneGain = null;
    this.filter = null;
    this.analyser = null;

    // State
    this.baseFilterFreq = 380;
    this.targetFilterFreq = 380;
  }

  init() {
    if (this.ctx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master volume & analyser
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0; // Starts muted

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Warm Lowpass Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = this.baseFilterFreq;
    this.filter.Q.value = 3.5;
    this.filter.connect(this.masterGain);

    this.startAmbientGenerators();
  }

  startAmbientGenerators() {
    const rootFreq = 55.0; // A1 warm root

    // Sub Drone Oscillator 1
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.value = rootFreq;

    // Detuned Oscillator 2
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'sine';
    this.osc2.frequency.value = rootFreq * 1.5; // Perfect fifth
    this.osc2.detune.value = 8; // Gentle chorusing

    // Harmonic Pad Oscillator 3
    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = 'triangle';
    this.osc3.frequency.value = rootFreq * 3.0; // Octave + Fifth

    // LFO for breathing filter modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.12; // 8-second slow cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);

    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.28;

    this.osc1.connect(padGain);
    this.osc2.connect(padGain);
    this.osc3.connect(padGain);
    padGain.connect(this.filter);

    this.osc1.start();
    this.osc2.start();
    this.osc3.start();
    lfo.start();
  }

  setChapterMood(chapterIndex) {
    if (!this.ctx || !this.osc1 || !this.osc2 || !this.osc3) return;
    // Root notes across chapters: A1, C2, D2, E2, G2, A2
    const roots = [55.0, 65.41, 73.42, 82.41, 98.0, 110.0];
    const root = roots[chapterIndex % roots.length];
    const t = this.ctx.currentTime;
    this.osc1.frequency.setTargetAtTime(root, t, 0.8);
    this.osc2.frequency.setTargetAtTime(root * 1.5, t, 0.8);
    this.osc3.frequency.setTargetAtTime(root * 3.0, t, 0.8);
  }

  toggleSound() {
    if (!this.ctx) {
      this.init();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0.0 : 0.45;

    // Smooth ramp
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.8);

    return !this.isMuted;
  }

  // React dynamically to scroll speed: opens filter as camera accelerates
  setSpeed(velocity) {
    if (!this.filter || !this.ctx) return;
    const boost = Math.min(Math.abs(velocity) * 4500, 1200);
    this.targetFilterFreq = this.baseFilterFreq + boost;
    this.filter.frequency.setTargetAtTime(this.targetFilterFreq, this.ctx.currentTime, 0.1);
  }

  // Soft crystalline UI hover chime
  playHoverChime() {
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880 + Math.random() * 220, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // Harmonic discovery chime (two notes ascending)
  playDiscoveryChime() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    [587.33, 880.0, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.12, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.6);
    });
  }

  getFrequencyData(array) {
    if (this.analyser && !this.isMuted) {
      this.analyser.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }
}
