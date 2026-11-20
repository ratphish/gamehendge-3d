/**
 * Gamehendge Neo-CD-i Procedural Web Audio Engine
 * Zero external audio files: Pure Web Audio API synthesis
 */

import { GAMEHENDGE_CONFIG } from './config.js';

// Semitone map relative to A4 (440Hz)
const NOTE_SEMITONES = {
  'C': -9, 'C#': -8, 'Db': -8,
  'D': -7, 'D#': -6, 'Eb': -6,
  'E': -5,
  'F': -4, 'F#': -3, 'Gb': -3,
  'G': -2, 'G#': -1, 'Ab': -1,
  'A': 0, 'A#': 1, 'Bb': 1,
  'B': 2
};

/**
 * Converts a note string (e.g., 'C4', 'F#5', 'Bb3') to its frequency in Hertz.
 */
export function noteToFreq(noteStr) {
  if (!noteStr || typeof noteStr !== 'string') return 0;
  const match = noteStr.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
  if (!match) return 0;
  const noteName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const octave = parseInt(match[2], 10);
  const semitonesFromA4 = (NOTE_SEMITONES[noteName] ?? 0) + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

export class GameAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.filterNode = null;
    this.delayNode = null;
    this.feedbackGain = null;

    this.mode = 'auto'; // 'auto' (spatial) or 'manual' (CD-i pinned)
    this.currentThemeKey = 'lizards';
    this.isPlaying = false;
    this.masterVolume = 0.65;

    this.timerId = null;
    this.stepIndex = 0;
    this.bassStepIndex = 0;
    this.nextNoteTime = 0;

    this.biomes = GAMEHENDGE_CONFIG.biomes;
    this.themes = GAMEHENDGE_CONFIG.audio.themes;
  }

  /**
   * Initializes AudioContext upon user gesture (Insert Disc).
   */
  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API is not supported in this browser environment.');
      return;
    }

    this.ctx = new AudioContextClass();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

    // Warm Moog-style master filter
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(4500, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Spatial echo delay line
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.25, this.ctx.currentTime);

    this.feedbackGain = this.ctx.createGain();
    this.feedbackGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

    // Routing: Filter -> Master -> Out, with Filter -> Delay -> Feedback -> Master
    this.filterNode.connect(this.masterGain);
    this.filterNode.connect(this.delayNode);
    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode);
    this.feedbackGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.startSequencer();
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  setMode(mode) {
    this.mode = mode;
  }

  selectTrack(themeKey) {
    if (this.themes[themeKey]) {
      this.currentThemeKey = themeKey;
      this.stepIndex = 0;
      this.bassStepIndex = 0;
    }
  }

  nextTrack() {
    const keys = Object.keys(this.themes);
    const idx = keys.indexOf(this.currentThemeKey);
    const nextIdx = (idx + 1) % keys.length;
    this.selectTrack(keys[nextIdx]);
  }

  prevTrack() {
    const keys = Object.keys(this.themes);
    const idx = keys.indexOf(this.currentThemeKey);
    const prevIdx = (idx - 1 + keys.length) % keys.length;
    this.selectTrack(keys[prevIdx]);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.masterGain && this.ctx) {
      const target = this.isPlaying ? this.masterVolume : 0.0001;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isPlaying;
  }

  getCurrentTrackInfo() {
    const theme = this.themes[this.currentThemeKey] || this.themes.lizards;
    return {
      id: theme.id,
      title: theme.title,
      bpm: theme.bpm,
      isPlaying: this.isPlaying,
      mode: this.mode
    };
  }

  /**
   * Calculates the nearest biome theme from player coordinates.
   */
  getClosestBiomeTheme(playerX, playerZ) {
    let closestTheme = 'lizards';
    let minDistanceSq = Infinity;

    for (const [key, biome] of Object.entries(this.biomes)) {
      const dx = playerX - biome.x;
      const dz = playerZ - biome.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestTheme = biome.theme;
      }
    }

    return closestTheme;
  }

  /**
   * Updates spatial theme crossfading based on player coordinates.
   */
  updateSpatialAudio(playerX, playerZ) {
    if (this.mode !== 'auto') return;
    const closest = this.getClosestBiomeTheme(playerX, playerZ);
    if (closest !== this.currentThemeKey) {
      this.currentThemeKey = closest;
      this.stepIndex = 0;
      this.bassStepIndex = 0;
    }
  }

  /**
   * Procedural note synthesizer
   */
  playSynthNote(freq, durationSec, type = 'sawtooth', velocity = 0.3) {
    if (!this.ctx || !this.filterNode || freq <= 0) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const envGain = this.ctx.createGain();

    osc1.type = type;
    osc1.frequency.setValueAtTime(freq, now);

    // Subtle detune for rich vintage synth chorus
    osc2.type = type === 'sawtooth' ? 'square' : 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.004, now);

    // Envelope: quick attack, natural exponential decay
    envGain.gain.setValueAtTime(0.0001, now);
    envGain.gain.linearRampToValueAtTime(velocity, now + 0.02);
    envGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.05, durationSec * 0.95));

    osc1.connect(envGain);
    osc2.connect(envGain);
    envGain.connect(this.filterNode);

    osc1.onended = () => {
      try {
        osc1.disconnect();
        osc2.disconnect();
        envGain.disconnect();
      } catch (_) {}
    };

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec + 0.1);
    osc2.stop(now + durationSec + 0.1);
  }

  playBassNote(freq, durationSec) {
    if (!this.ctx || !this.filterNode || freq <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 0.9);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (_) {}
    };

    osc.start(now);
    osc.stop(now + durationSec + 0.05);
  }

  /**
   * Sound effect stings for character interactions
   */
  playSting(stingType) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (stingType) {
      case 'wilson_chant': {
        // Dramatic low thunder chord
        [110, 146.83, 164.81].forEach((f, idx) => {
          setTimeout(() => this.playSynthNote(f, 0.8, 'sawtooth', 0.5), idx * 80);
        });
        break;
      }
      case 'read_book': {
        // Ethereal ascending chime
        ['C5', 'E5', 'G5', 'B5', 'C6', 'E6'].forEach((n, idx) => {
          setTimeout(() => this.playSynthNote(noteToFreq(n), 0.6, 'sine', 0.25), idx * 75);
        });
        break;
      }
      case 'sloth_contract': {
        // Gritty low funk bass slide
        ['E2', 'G2', 'Bb2', 'B2'].forEach((n, idx) => {
          setTimeout(() => this.playBassNote(noteToFreq(n), 0.3), idx * 100);
        });
        break;
      }
      default: {
        // Pleasant CD-i UI blip
        this.playSynthNote(880, 0.08, 'sine', 0.2);
        break;
      }
    }
  }

  /**
   * High-polish procedural sound effects for Survivor Mode
   */
  playCombatSFX(type) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'shot': {
        // Snappy laser/whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.09);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        break;
      }
      case 'hit': {
        // Crunchy impact punch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        break;
      }
      case 'gem': {
        // Sweet ascending chime
        const pitches = [880, 1046.5, 1174.6, 1318.5, 1567.9];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        break;
      }
      case 'level_up': {
        // Triumphant brass fanfare
        ['C5', 'E5', 'G5', 'C6'].forEach((n, idx) => {
          setTimeout(() => {
            this.playSynthNote(noteToFreq(n), 0.35, 'sawtooth', 0.4);
          }, idx * 90);
        });
        break;
      }
      case 'hurt': {
        // Heavy low warning buzz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.18);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.19);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        break;
      }
      case 'boss_alert': {
        // Thunderous ominous warning
        [73.42, 110, 130.81].forEach((f) => {
          this.playBassNote(f, 1.2);
        });
        break;
      }
      case 'slide': {
        // Wind slide whoosh
        this.playSynthNote(320, 0.12, 'triangle', 0.15);
        break;
      }
    }
  }

  startSequencer() {
    this.isPlaying = true;
    this.tickAccumulator = 0;

    const scheduleStep = () => {
      if (!this.isPlaying || !this.ctx) {
        this.timerId = setTimeout(scheduleStep, 100);
        return;
      }

      const theme = this.themes[this.currentThemeKey] || this.themes.lizards;
      const bpm = theme.bpm || 120;
      const sixteenthSec = (60 / bpm) / 4;

      // Play lead melody note with true rhythmic duration
      let currentDurationSixteenths = 2;
      if (theme.melody && theme.melody.length > 0) {
        const item = theme.melody[this.stepIndex % theme.melody.length];
        const [note, durationSixteenths] = item;
        currentDurationSixteenths = durationSixteenths || 2;
        const freq = noteToFreq(note);
        const durationSec = currentDurationSixteenths * sixteenthSec;
        this.playSynthNote(freq, durationSec, 'sawtooth', 0.25);
        this.stepIndex = (this.stepIndex + 1) % theme.melody.length;
      }

      // Play bassline accompaniment in sync with harmonic bars
      this.tickAccumulator = (this.tickAccumulator || 0) + currentDurationSixteenths;
      if (this.tickAccumulator >= 8 && theme.bass && theme.bass.length > 0) {
        this.tickAccumulator = 0;
        const bassNote = theme.bass[this.bassStepIndex % theme.bass.length];
        const bassFreq = noteToFreq(bassNote);
        this.playBassNote(bassFreq, sixteenthSec * 6);
        this.bassStepIndex = (this.bassStepIndex + 1) % theme.bass.length;
      }

      const nextDelayMs = Math.max(90, currentDurationSixteenths * sixteenthSec * 1000);
      this.timerId = setTimeout(scheduleStep, nextDelayMs);
    };

    scheduleStep();
  }
}
