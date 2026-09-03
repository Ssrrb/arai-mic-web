/**
 * Procedural Audio Engine for TUKU Basketball Experience
 * Generates tactile button clicks, edition sweeps, modal swells, launch whooshes,
 * and authentic basketball swish sounds using the Web Audio API.
 * 100% self-contained, zero external dependencies, zero latency.
 */

import { BallEdition } from '../components/Basketball';

let audioCtxInstance: AudioContext | null = null;
let isMutedState = false;

// Initialize mute state from localStorage if available in browser
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('tuku_audio_muted');
    if (saved !== null) {
      isMutedState = saved === 'true';
    }
  } catch {
    // Ignore localStorage access restrictions
  }
}

/**
 * Lazily retrieves or instantiates the singleton AudioContext.
 * Automatically handles browser user-gesture suspension.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    if (!audioCtxInstance) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      audioCtxInstance = new AudioCtx();
    }

    if (audioCtxInstance.state === 'suspended') {
      audioCtxInstance.resume();
    }

    return audioCtxInstance;
  } catch {
    return null;
  }
}

export function isSoundMuted(): boolean {
  return isMutedState;
}

export function setSoundMuted(muted: boolean): void {
  isMutedState = muted;
  try {
    localStorage.setItem('tuku_audio_muted', String(muted));
  } catch {
    // Ignore
  }
}

export function toggleSound(): boolean {
  setSoundMuted(!isMutedState);
  if (!isMutedState) {
    playButtonClick('default');
  }
  return isMutedState;
}

export type ButtonSoundVariant = 'default' | 'subtle' | 'pop' | 'success' | 'close' | 'nav';

/**
 * Plays tactile button click sounds with high-precision procedural synthesis.
 */
export function playButtonClick(variant: ButtonSoundVariant = 'default') {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (variant) {
      case 'subtle': {
        // High-pitch gentle micro-tap for steppers (+, -) and secondary actions
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.025);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
        break;
      }

      case 'pop': {
        // Bouncy basketball dribble acoustic pop for chips and selections
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.05);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'success': {
        // Harmonious celebratory two-tone chime for purchase/message send
        const notes = [659.25, 987.77]; // E5, B5
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + index * 0.07;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.001, noteTime);
          gain.gain.linearRampToValueAtTime(0.14, noteTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.28);
        });
        break;
      }

      case 'close': {
        // Soft descending dismiss tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'nav': {
        // Crisp, firm mechanical tap for navigation tabs and links
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'default':
      default: {
        // Signature tactile haptic UI click (transient micro-tick + snappy pitch drop)
        // 1. Transient click
        const bufferSize = Math.floor(ctx.sampleRate * 0.008);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2400, now);
        noiseFilter.Q.setValueAtTime(2.0, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.008);

        // 2. Body pitch pop
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.038);

        oscGain.gain.setValueAtTime(0.15, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.038);
        break;
      }
    }
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Sonic signatures tailored for each basketball edition switch
 */
export function playEditionSound(edition: BallEdition | string) {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    let startFreq = 480;
    let targetFreq = 720;
    let waveType: OscillatorType = 'sine';

    if (edition === 'nebula') {
      // Cosmic shimmering sweep
      startFreq = 380;
      targetFreq = 587.33; // D5
      waveType = 'sine';
    } else if (edition === 'fuego') {
      // Warm, aggressive punch
      startFreq = 320;
      targetFreq = 440; // A4
      waveType = 'triangle';
    } else if (edition === 'oro') {
      // Golden bright bell
      startFreq = 520;
      targetFreq = 659.25; // E5
      waveType = 'sine';
    } else if (edition === 'metal') {
      // Industrial metallic resonance
      startFreq = 620;
      targetFreq = 784; // G5
      waveType = 'triangle';
    }

    osc.type = waveType;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Modal opening swell (soft, spacious futuristic whoosh)
 */
export function playModalOpenSound() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.1);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Modal closing tone (soft downward dissolve)
 */
export function playModalCloseSound() {
  playButtonClick('close');
}

/**
 * Energetic whoosh & launch pulse for the "Añadir al Carrito" shot
 */
export function playAddToCartLaunchSound() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Energetic ascending sine tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.12);

    oscGain.gain.setValueAtTime(0.01, now);
    oscGain.gain.linearRampToValueAtTime(0.22, now + 0.03);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);

    // 2. Air whoosh burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.14);
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Procedural Basketball Swish Sound Effect
 * Generates an authentic nylon net "swish" and rim vibration using the Web Audio API.
 */
export function playBasketballSwish() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Swish nylon noise (filtered white noise burst simulating ball gliding through nylon net)
    const bufferSize = Math.floor(ctx.sampleRate * 0.32);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(850, now + 0.28);
    filter.Q.setValueAtTime(3.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.32);

    // 2. Net snap / rim vibration tone (subtle low-frequency resonant thud)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now + 0.03);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.24);

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.16, now + 0.05);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now + 0.03);
    osc.stop(now + 0.28);
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Initializes a global click handler that ensures every button or interactive
 * element on the page plays a tactile click sound, unless it already triggered
 * a specific custom sound event.
 */
export function initGlobalButtonSoundListener(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleGlobalClick = (event: MouseEvent) => {
    // Check if clicked element or its parent is a button or interactive control
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const button = target.closest('button, [role="button"], a[href^="#"]');
    if (!button) return;

    // Check if the element opted out of default sound (because it triggered a custom sound)
    if (button.getAttribute('data-sound-custom') === 'true') {
      return;
    }

    // Play default click sound
    playButtonClick('default');
  };

  window.addEventListener('click', handleGlobalClick, { capture: true });
  return () => {
    window.removeEventListener('click', handleGlobalClick, { capture: true });
  };
}
