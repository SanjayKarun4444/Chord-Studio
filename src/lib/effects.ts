import { getAudioCtx } from "./audio-engine";

/**
 * Creates a waveshaper saturator node with a soft-clip transfer curve.
 * Formula: (pi + amount) * x / (pi + amount * |x|)
 */
export function createSaturator(
  ctx: AudioContext,
  amount: number = 3,
): WaveShaperNode {
  const shaper = ctx.createWaveShaper();
  const samples = 8192;
  const curve = new Float32Array(samples);
  const pi = Math.PI;

  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((pi + amount) * x) / (pi + amount * Math.abs(x));
  }

  shaper.curve = curve;
  shaper.oversample = "2x";
  return shaper;
}

/**
 * Triggers a sidechain duck on a gain node — dips gain then recovers.
 * Call this whenever a kick is scheduled.
 */
export function triggerSidechainDuck(
  gainNode: GainNode,
  time: number,
  duckTo: number = 0.35,
  attackMs: number = 5,
  releaseMs: number = 80,
): void {
  const ctx = getAudioCtx();
  const g = gainNode.gain;
  // Cancel any pending ramps at this time to avoid conflicts
  g.setValueAtTime(g.value, time);
  g.linearRampToValueAtTime(duckTo, time + attackMs / 1000);
  g.linearRampToValueAtTime(1, time + (attackMs + releaseMs) / 1000);
}
