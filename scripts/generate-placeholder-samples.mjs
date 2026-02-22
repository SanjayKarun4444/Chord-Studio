/**
 * Placeholder drum sample generator — zero dependencies.
 * Writes raw WAV files (44-byte RIFF header + 16-bit PCM mono data).
 *
 * Usage: node scripts/generate-placeholder-samples.mjs
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const SAMPLE_RATE = 44100;
const OUT_DIR = join(process.cwd(), "public", "samples", "drums");

// ─── WAV Writer ───

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buf = Buffer.alloc(44 + dataSize);

  // RIFF header
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);

  // fmt chunk
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);      // chunk size
  buf.writeUInt16LE(1, 20);       // PCM format
  buf.writeUInt16LE(1, 22);       // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);       // block align
  buf.writeUInt16LE(16, 34);      // bits per sample

  // data chunk
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = Math.round(clamped * 32767);
    buf.writeInt16LE(int16, 44 + i * 2);
  }

  writeFileSync(filePath, buf);
}

// ─── Synthesis Helpers ───

function noise(len) {
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) out[i] = Math.random() * 2 - 1;
  return out;
}

function expDecay(i, totalSamples) {
  return Math.exp(-5 * (i / totalSamples));
}

function hpf(samples, cutoffHz) {
  // Simple one-pole HPF
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SAMPLE_RATE;
  const alpha = rc / (rc + dt);
  const out = new Float32Array(samples.length);
  out[0] = samples[0];
  for (let i = 1; i < samples.length; i++) {
    out[i] = alpha * (out[i - 1] + samples[i] - samples[i - 1]);
  }
  return out;
}

function bpf(samples, centerHz, q) {
  // Simple biquad BPF
  const w0 = 2 * Math.PI * centerHz / SAMPLE_RATE;
  const alpha = Math.sin(w0) / (2 * q);
  const b0 = alpha;
  const b1 = 0;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(w0);
  const a2 = 1 - alpha;
  const out = new Float32Array(samples.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    out[i] = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x0;
    y2 = y1; y1 = out[i];
  }
  return out;
}

function mix(a, b, gainA, gainB) {
  const len = Math.max(a.length, b.length);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = (i < a.length ? a[i] * gainA : 0) + (i < b.length ? b[i] * gainB : 0);
  }
  return out;
}

function applyEnvelope(samples, decayRate) {
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = samples[i] * Math.exp(-decayRate * (i / SAMPLE_RATE));
  }
  return out;
}

// Tiny fade-in (2ms) to prevent clicks
function fadeIn(samples, ms = 2) {
  const fadeSamples = Math.floor(SAMPLE_RATE * ms / 1000);
  for (let i = 0; i < fadeSamples && i < samples.length; i++) {
    samples[i] *= i / fadeSamples;
  }
  return samples;
}

// ─── Drum Synthesizers ───

function synthKick({ freqStart = 150, freqEnd = 45, sweepMs = 80, durationMs = 200, clickGain = 0.3 } = {}) {
  const len = Math.ceil(SAMPLE_RATE * durationMs / 1000);
  const sweepSamples = Math.ceil(SAMPLE_RATE * sweepMs / 1000);
  const out = new Float32Array(len);

  // Sine with pitch sweep
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / sweepSamples;
    const freq = t < 1
      ? freqStart * Math.pow(freqEnd / freqStart, t)
      : freqEnd;
    out[i] = Math.sin(phase) * expDecay(i, len);
    phase += 2 * Math.PI * freq / SAMPLE_RATE;
  }

  // Click transient
  const clickLen = Math.ceil(SAMPLE_RATE * 0.01);
  const click = bpf(noise(clickLen), 3500, 2);
  for (let i = 0; i < clickLen && i < len; i++) {
    out[i] += click[i] * clickGain * expDecay(i, clickLen);
  }

  return fadeIn(out);
}

function synthSnare({ hpfFreq = 2500, bodyStart = 200, bodyEnd = 130, durationMs = 200, noiseGain = 0.8, bodyGain = 0.4 } = {}) {
  const len = Math.ceil(SAMPLE_RATE * durationMs / 1000);

  // Noise component
  const n = applyEnvelope(hpf(noise(len), hpfFreq), 15);

  // Tonal body
  const bodyLen = Math.ceil(SAMPLE_RATE * 0.05);
  const body = new Float32Array(len);
  let phase = 0;
  for (let i = 0; i < bodyLen; i++) {
    const t = i / bodyLen;
    const freq = bodyStart * Math.pow(bodyEnd / bodyStart, t);
    body[i] = Math.sin(phase) * expDecay(i, bodyLen);
    phase += 2 * Math.PI * freq / SAMPLE_RATE;
  }

  return fadeIn(mix(n, body, noiseGain, bodyGain));
}

function synthHihat({ hpfFreq = 7000, durationMs = 50, gain = 0.5 } = {}) {
  const len = Math.ceil(SAMPLE_RATE * durationMs / 1000);
  const out = applyEnvelope(hpf(noise(len), hpfFreq), 40);
  for (let i = 0; i < len; i++) out[i] *= gain;
  return fadeIn(out);
}

function synthOhat({ hpfFreq = 6000, durationMs = 150, gain = 0.5 } = {}) {
  const len = Math.ceil(SAMPLE_RATE * durationMs / 1000);
  const out = applyEnvelope(hpf(noise(len), hpfFreq), 10);
  for (let i = 0; i < len; i++) out[i] *= gain;
  return fadeIn(out);
}

function synthClap({ bpfFreq = 2200, bpfQ = 0.8, tapDelayMs = 12, durationMs = 120, gain = 0.7 } = {}) {
  const len = Math.ceil(SAMPLE_RATE * durationMs / 1000);
  const out = new Float32Array(len);
  const tapGains = [0.5, 0.5, 1.0];
  const tapDelaySamples = Math.ceil(SAMPLE_RATE * tapDelayMs / 1000);

  tapGains.forEach((tapVel, tapIdx) => {
    const offset = tapIdx * tapDelaySamples;
    const tapLen = Math.ceil(SAMPLE_RATE * 0.1);
    const tap = applyEnvelope(bpf(noise(tapLen), bpfFreq, bpfQ), 20);
    for (let i = 0; i < tapLen && (i + offset) < len; i++) {
      out[i + offset] += tap[i] * tapVel * gain;
    }
  });

  return fadeIn(out);
}

// ─── Genre Pack Definitions ───

const PACKS = {
  common: {
    label: "Common",
    kick:  [{ n: 2 }],
    snare: [{ n: 2 }],
    hihat: [{ n: 3 }],
    ohat:  [{ n: 2 }],
    clap:  [{ n: 2 }],
  },
  trap: {
    label: "Trap",
    kick:  [{ n: 3, freqStart: 160, freqEnd: 38, sweepMs: 90, durationMs: 250 }],
    snare: [{ n: 2, hpfFreq: 2800, bodyGain: 0.3 }],
    hihat: [{ n: 4, hpfFreq: 8000, durationMs: 35, gain: 0.45 }],
    ohat:  [{ n: 2, hpfFreq: 6500, durationMs: 120 }],
    clap:  [{ n: 2, bpfFreq: 2400, gain: 0.75 }],
  },
  lofi: {
    label: "Lo-Fi",
    kick:  [{ n: 2, freqStart: 130, freqEnd: 50, durationMs: 180, clickGain: 0.15 }],
    snare: [{ n: 2, hpfFreq: 2000, noiseGain: 0.6, bodyGain: 0.35 }],
    hihat: [{ n: 3, hpfFreq: 5500, durationMs: 45, gain: 0.35 }],
    ohat:  [{ n: 2, hpfFreq: 5000, durationMs: 130, gain: 0.35 }],
    clap:  [{ n: 2, bpfFreq: 2000, gain: 0.55 }],
  },
  boom_bap: {
    label: "Boom Bap",
    kick:  [{ n: 2, freqStart: 155, freqEnd: 42, sweepMs: 85, durationMs: 220 }],
    snare: [{ n: 2, hpfFreq: 2200, noiseGain: 0.85, bodyGain: 0.45 }],
    hihat: [{ n: 3, hpfFreq: 6500, durationMs: 55, gain: 0.5 }],
    ohat:  [{ n: 2, hpfFreq: 5500, durationMs: 160, gain: 0.5 }],
    clap:  [{ n: 2, bpfFreq: 2100, gain: 0.7 }],
  },
  drill: {
    label: "Drill",
    kick:  [{ n: 2, freqStart: 170, freqEnd: 35, sweepMs: 95, durationMs: 260 }],
    snare: [{ n: 2, hpfFreq: 3000, noiseGain: 0.9, bodyGain: 0.3 }],
    hihat: [{ n: 4, hpfFreq: 8500, durationMs: 30, gain: 0.4 }],
    ohat:  [{ n: 2, hpfFreq: 7000, durationMs: 100, gain: 0.4 }],
    clap:  [{ n: 2, bpfFreq: 2500, gain: 0.8 }],
  },
  jazz: {
    label: "Jazz",
    kick:  [{ n: 2, freqStart: 120, freqEnd: 55, sweepMs: 60, durationMs: 150, clickGain: 0.15 }],
    snare: [{ n: 2, hpfFreq: 2000, noiseGain: 0.5, bodyGain: 0.3, durationMs: 160 }],
    hihat: [{ n: 3, hpfFreq: 6000, durationMs: 40, gain: 0.3 }],
    ohat:  [{ n: 2, hpfFreq: 5000, durationMs: 140, gain: 0.3 }],
    clap:  [{ n: 2, bpfFreq: 1800, gain: 0.4 }],
  },
  gospel: {
    label: "Gospel",
    kick:  [{ n: 2, freqStart: 140, freqEnd: 48, durationMs: 200 }],
    snare: [{ n: 2, hpfFreq: 2300, noiseGain: 0.75, bodyGain: 0.4 }],
    hihat: [{ n: 3, hpfFreq: 6500, durationMs: 50, gain: 0.45 }],
    ohat:  [{ n: 2, hpfFreq: 5500, durationMs: 150, gain: 0.45 }],
    clap:  [{ n: 2, bpfFreq: 2200, gain: 0.65 }],
  },
  house: {
    label: "House",
    kick:  [{ n: 2, freqStart: 160, freqEnd: 40, sweepMs: 100, durationMs: 240, clickGain: 0.35 }],
    snare: [{ n: 2, hpfFreq: 2600, noiseGain: 0.7 }],
    hihat: [{ n: 3, hpfFreq: 7500, durationMs: 40, gain: 0.4 }],
    ohat:  [{ n: 2, hpfFreq: 6000, durationMs: 160, gain: 0.45 }],
    clap:  [{ n: 2, bpfFreq: 2300, gain: 0.7 }],
  },
  rnb: {
    label: "R&B",
    kick:  [{ n: 2, freqStart: 135, freqEnd: 48, durationMs: 190, clickGain: 0.2 }],
    snare: [{ n: 2, hpfFreq: 2200, noiseGain: 0.65, bodyGain: 0.35 }],
    hihat: [{ n: 3, hpfFreq: 6000, durationMs: 45, gain: 0.35 }],
    ohat:  [{ n: 2, hpfFreq: 5500, durationMs: 140, gain: 0.35 }],
    clap:  [{ n: 2, bpfFreq: 2100, gain: 0.6 }],
  },
  afrobeats: {
    label: "Afrobeats",
    kick:  [{ n: 2, freqStart: 145, freqEnd: 44, sweepMs: 75, durationMs: 200 }],
    snare: [{ n: 2, hpfFreq: 2400, noiseGain: 0.7, bodyGain: 0.4 }],
    hihat: [{ n: 3, hpfFreq: 7000, durationMs: 45, gain: 0.45 }],
    ohat:  [{ n: 2, hpfFreq: 6000, durationMs: 140, gain: 0.45 }],
    clap:  [{ n: 2, bpfFreq: 2200, gain: 0.65 }],
  },
  funk: {
    label: "Funk",
    kick:  [{ n: 2, freqStart: 150, freqEnd: 46, sweepMs: 70, durationMs: 190, clickGain: 0.35 }],
    snare: [{ n: 2, hpfFreq: 2500, noiseGain: 0.8, bodyGain: 0.45 }],
    hihat: [{ n: 3, hpfFreq: 7000, durationMs: 48, gain: 0.5 }],
    ohat:  [{ n: 2, hpfFreq: 6000, durationMs: 145, gain: 0.5 }],
    clap:  [{ n: 2, bpfFreq: 2300, gain: 0.7 }],
  },
};

// ─── Generate all packs ───

const SYNTH_MAP = {
  kick: synthKick,
  snare: synthSnare,
  hihat: synthHihat,
  ohat: synthOhat,
  clap: synthClap,
};

let totalFiles = 0;

for (const [packId, pack] of Object.entries(PACKS)) {
  const dir = join(OUT_DIR, packId);
  mkdirSync(dir, { recursive: true });

  for (const drumType of ["kick", "snare", "hihat", "ohat", "clap"]) {
    const config = pack[drumType][0];
    const count = config.n;
    const synthFn = SYNTH_MAP[drumType];

    for (let v = 1; v <= count; v++) {
      // Add slight variation per round-robin sample
      const variation = {
        ...config,
      };
      delete variation.n;

      // Slight pitch/param jitter for round-robin variation
      if (drumType === "kick") {
        variation.freqStart = (variation.freqStart || 150) + (v - 1) * 5;
        variation.freqEnd = (variation.freqEnd || 45) + (v - 1) * 2;
      } else if (drumType === "snare") {
        variation.hpfFreq = (variation.hpfFreq || 2500) + (v - 1) * 100;
      } else if (drumType === "hihat" || drumType === "ohat") {
        variation.hpfFreq = (variation.hpfFreq || 7000) + (v - 1) * 200;
      } else if (drumType === "clap") {
        variation.bpfFreq = (variation.bpfFreq || 2200) + (v - 1) * 80;
      }

      const samples = synthFn(variation);
      const filePath = join(dir, `${drumType}_${v}.wav`);
      writeWav(filePath, samples);
      totalFiles++;
    }
  }

  console.log(`  ✓ ${packId}/ (${pack.label})`);
}

console.log(`\nGenerated ${totalFiles} placeholder WAV files in public/samples/drums/`);
