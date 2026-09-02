/**
 * Procedural Basketball Swish Sound Effect
 * Generates an authentic nylon net "swish" and rim vibration using the Web Audio API.
 * 100% self-contained, no external MP3 dependencies, zero latency.
 */

export function playBasketballSwish() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

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
    // Non-blocking fallback if browser policy blocks sound before user gesture
  }
}
