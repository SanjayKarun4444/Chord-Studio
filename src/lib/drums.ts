import { ensureAudioGraph, getDrumGain, getHatPanner } from "./audio-engine";
import type { DrumEngineMode, DrumType } from "./audio/drums/types";
import { SampleDrumPlayer } from "./audio/drums/sample-player";
import { emitDrumHit } from "./drum-events";

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
  } else {
    playSynthDrum(type, t, velocity);
  }
  emitDrumHit({ type: type as DrumType, velocity, scheduledTime: t });
}

// ─── Synth fallback (original implementation) ───

// Cached noise buffers — eliminates ~37 buffer allocations/sec at 140 BPM
let _snareNoiseBuf: AudioBuffer | null = null;
let _hihatNoiseBuf: AudioBuffer | null = null;
let _clapNoiseBuf: AudioBuffer | null = null;
let _crashNoiseBuf: AudioBuffer | null = null;
let _rideNoiseBuf: AudioBuffer | null = null;

function getNoiseBuffer(ctx: AudioContext, durationSec: number, key: "snare" | "hihat" | "clap" | "crash" | "ride"): AudioBuffer {
  const bufMap: Record<string, AudioBuffer | null> = {
    snare: _snareNoiseBuf, hihat: _hihatNoiseBuf, clap: _clapNoiseBuf,
    crash: _crashNoiseBuf, ride: _rideNoiseBuf,
  };
  if (bufMap[key] && bufMap[key]!.sampleRate === ctx.sampleRate) return bufMap[key]!;

  const len = Math.ceil(ctx.sampleRate * durationSec);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

  if (key === "snare") _snareNoiseBuf = buf;
  else if (key === "hihat") _hihatNoiseBuf = buf;
  else if (key === "clap") _clapNoiseBuf = buf;
  else if (key === "crash") _crashNoiseBuf = buf;
  else _rideNoiseBuf = buf;
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

  } else if (type === "crash") {
    // Crash: noise → HPF 4kHz, 600ms decay (metallic burst)
    const buf = getNoiseBuffer(ctx, 0.7, "crash");
    const n = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    n.buffer = buf;
    f.type = "highpass";
    f.frequency.value = 4000;
    n.connect(f);
    f.connect(g);
    g.connect(drumGain);
    g.gain.setValueAtTime(0.7 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    n.start(t);
    n.stop(t + 0.61);

  } else if (type === "ride") {
    // Ride: noise → BP 8kHz + sine ping 5.2kHz, 350ms decay
    const buf = getNoiseBuffer(ctx, 0.4, "ride");
    const n = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    n.buffer = buf;
    f.type = "bandpass";
    f.frequency.value = 8000;
    f.Q.value = 1.5;
    n.connect(f);
    f.connect(g);
    g.connect(drumGain);
    g.gain.setValueAtTime(0.4 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    n.start(t);
    n.stop(t + 0.36);

    // Sine ping for bell tone
    const ping = ctx.createOscillator();
    ping.type = "sine";
    ping.frequency.value = 5200;
    const pingGain = ctx.createGain();
    pingGain.gain.setValueAtTime(0.15 * velocity, t);
    pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    ping.connect(pingGain);
    pingGain.connect(drumGain);
    ping.start(t);
    ping.stop(t + 0.26);

  } else if (type === "high_tom") {
    // High tom: sine 300→180Hz, 150ms decay
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(drumGain);
    o.type = "sine";
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.15);
    g.gain.setValueAtTime(0.8 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.start(t);
    o.stop(t + 0.16);

  } else if (type === "mid_tom") {
    // Mid tom: sine 240→140Hz, 180ms decay
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(drumGain);
    o.type = "sine";
    o.frequency.setValueAtTime(240, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.18);
    g.gain.setValueAtTime(0.8 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.start(t);
    o.stop(t + 0.19);

  } else if (type === "floor_tom") {
    // Floor tom: sine 180→90Hz, 220ms decay
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(drumGain);
    o.type = "sine";
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.22);
    g.gain.setValueAtTime(0.9 * velocity, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.start(t);
    o.stop(t + 0.23);
  }
}
