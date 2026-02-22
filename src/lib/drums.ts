import { ensureAudioGraph, getDrumGain, getHatPanner } from "./audio-engine";
import type { DrumEngineMode, DrumType } from "./audio/drums/types";
import { SampleDrumPlayer } from "./audio/drums/sample-player";

// ─── Engine mode dispatcher ───

let _engineMode: DrumEngineMode = "samples";
let _samplePlayer: SampleDrumPlayer | null = null;

export function setDrumEngineMode(mode: DrumEngineMode): void {
  _engineMode = mode;
}

export function getDrumEngineMode(): DrumEngineMode {
  return _engineMode;
}

export function initSamplePlayer(ctx: AudioContext, dest: AudioNode): SampleDrumPlayer {
  _samplePlayer = new SampleDrumPlayer(ctx, dest);
  return _samplePlayer;
}

export function getSamplePlayer(): SampleDrumPlayer | null {
  return _samplePlayer;
}

export function playDrum(type: string, t: number, velocity: number = 1.0): void {
  if (_engineMode === "samples" && _samplePlayer?.ready) {
    _samplePlayer.play(type as DrumType, t, { velocity });
    return;
  }
  playSynthDrum(type, t, velocity);
}

// ─── Synth fallback (original implementation) ───

// Cached noise buffers — eliminates ~37 buffer allocations/sec at 140 BPM
let _snareNoiseBuf: AudioBuffer | null = null;
let _hihatNoiseBuf: AudioBuffer | null = null;
let _clapNoiseBuf: AudioBuffer | null = null;

function getNoiseBuffer(ctx: AudioContext, durationSec: number, key: "snare" | "hihat" | "clap"): AudioBuffer {
  const bufMap = { snare: _snareNoiseBuf, hihat: _hihatNoiseBuf, clap: _clapNoiseBuf };
  if (bufMap[key] && bufMap[key]!.sampleRate === ctx.sampleRate) return bufMap[key]!;

  const len = Math.ceil(ctx.sampleRate * durationSec);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

  if (key === "snare") _snareNoiseBuf = buf;
  else if (key === "hihat") _hihatNoiseBuf = buf;
  else _clapNoiseBuf = buf;
  return buf;
}

export function playSynthDrum(type: string, t: number, velocity: number = 1.0): void {
  const ctx = ensureAudioGraph();
  const drumGain = getDrumGain()!;

  if (type === "kick") {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(drumGain);
    o.type = "sine";
    // Faster pitch envelope: 150→45Hz over 80ms for more punch
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    g.gain.setValueAtTime(1 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.start(t);
    o.stop(t + 0.21);

    // Click transient: 10ms noise burst → bandpass 3500Hz for definition
    const clickBuf = getNoiseBuffer(ctx, 0.01, "snare"); // reuse snare noise
    const clickSrc = ctx.createBufferSource();
    clickSrc.buffer = clickBuf;
    const clickBP = ctx.createBiquadFilter();
    clickBP.type = "bandpass";
    clickBP.frequency.value = 3500;
    clickBP.Q.value = 2;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.3 * velocity, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.01);
    clickSrc.connect(clickBP);
    clickBP.connect(clickGain);
    clickGain.connect(drumGain);
    clickSrc.start(t);
    clickSrc.stop(t + 0.011);

  } else if (type === "snare") {
    // Noise component with HPF
    const buf = getNoiseBuffer(ctx, 0.2, "snare");
    const n = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    n.buffer = buf;
    f.type = "highpass";
    f.frequency.value = 2500; // snappier, less midrange mud
    n.connect(f);
    f.connect(g);
    g.connect(drumGain);
    g.gain.setValueAtTime(0.8 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    n.start(t);
    n.stop(t + 0.21);

    // Tonal body: sine 200→130Hz over 50ms adds "crack"
    const body = ctx.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(200, t);
    body.frequency.exponentialRampToValueAtTime(130, t + 0.05);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.4 * velocity, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    body.connect(bodyGain);
    bodyGain.connect(drumGain);
    body.start(t);
    body.stop(t + 0.06);

  } else if (type === "hihat") {
    const hatDest = getHatPanner() || drumGain;
    const buf = getNoiseBuffer(ctx, 0.05, "hihat");
    const n = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    n.buffer = buf;
    f.type = "highpass";
    f.frequency.value = 7000;
    n.connect(f);
    f.connect(g);
    g.connect(hatDest);
    // Decay envelope via gain automation instead of baked-in buffer
    g.gain.setValueAtTime(0.5 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    n.start(t);
    n.stop(t + 0.06);

  } else if (type === "ohat") {
    const hatDest = getHatPanner() || drumGain;
    // Open hihat: noise → HPF 6000Hz, longer 150ms decay
    const buf = getNoiseBuffer(ctx, 0.2, "hihat");
    const n = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    n.buffer = buf;
    f.type = "highpass";
    f.frequency.value = 6000;
    n.connect(f);
    f.connect(g);
    g.connect(hatDest);
    g.gain.setValueAtTime(0.5 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    n.start(t);
    n.stop(t + 0.16);

  } else if (type === "clap") {
    // Multi-tap clap: 3 noise bursts, 12ms apart, final tap loudest
    const tapGains = [0.5, 0.5, 1.0];
    const tapOffsets = [0, 0.012, 0.024];

    tapGains.forEach((tapVel, i) => {
      const buf = getNoiseBuffer(ctx, 0.1, "clap");
      const n = ctx.createBufferSource();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      n.buffer = buf;
      f.type = "bandpass";
      f.frequency.value = 2200;
      f.Q.value = 0.8;
      n.connect(f);
      f.connect(g);
      g.connect(drumGain);
      const tapTime = t + tapOffsets[i];
      g.gain.setValueAtTime(0.7 * velocity * tapVel, tapTime);
      g.gain.exponentialRampToValueAtTime(0.001, tapTime + 0.1);
      n.start(tapTime);
      n.stop(tapTime + 0.11);
    });
  }
}
