import { ensureAudioGraph, getMasterGain } from "./audio-engine";

function voicePiano(freq: number, t: number, dur: number): void {
  const ctx = ensureAudioGraph();
  const out = getMasterGain()!;
  const amp = ctx.createGain();
  amp.connect(out);
  const o1 = ctx.createOscillator();
  o1.type = "sine";
  o1.frequency.value = freq;
  o1.connect(amp);
  const o2 = ctx.createOscillator();
  o2.type = "triangle";
  o2.frequency.value = freq * 2.001;
  const hg = ctx.createGain();
  hg.gain.value = 0.08;
  o2.connect(hg);
  hg.connect(amp);
  const r = Math.min(dur * 0.4, 1.8);
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.32, t + 0.005);
  amp.gain.exponentialRampToValueAtTime(0.14, t + 0.12);
  amp.gain.exponentialRampToValueAtTime(0.08, t + dur - 0.05);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + r);
  o1.start(t);
  o2.start(t);
  o1.stop(t + dur + r + 0.1);
  o2.stop(t + dur + r + 0.1);
}

function voiceSynth(freq: number, t: number, dur: number): void {
  const ctx = ensureAudioGraph();
  const amp = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.Q.value = 6;
  filt.frequency.setValueAtTime(200, t);
  filt.frequency.exponentialRampToValueAtTime(freq * 8, t + 0.4);
  amp.connect(filt);
  filt.connect(getMasterGain()!);
  [0, 7, -7, 12].forEach((dt) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    o.detune.value = dt;
    const g = ctx.createGain();
    g.gain.value = 0.18;
    o.connect(g);
    g.connect(amp);
    o.start(t);
    o.stop(t + dur + 0.3);
  });
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.55, t + 0.08);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
}

function voicePad(freq: number, t: number, dur: number): void {
  const ctx = ensureAudioGraph();
  const amp = ctx.createGain();
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = freq * 4;
  f.Q.value = 0.5;
  amp.connect(f);
  f.connect(getMasterGain()!);
  [-14, -7, 0, 7, 14].forEach((dt, i) => {
    const o = ctx.createOscillator();
    o.type = i % 2 === 0 ? "sine" : "triangle";
    o.frequency.value = freq;
    o.detune.value = dt;
    const g = ctx.createGain();
    g.gain.value = 0.14;
    o.connect(g);
    g.connect(amp);
    o.start(t);
    o.stop(t + dur + 2);
  });
  const atk = Math.min(dur * 0.35, 1.2);
  const rel = Math.min(dur * 0.5, 2.0);
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.5, t + atk);
  amp.gain.linearRampToValueAtTime(0.0001, t + dur + rel);
}

function voiceOrgan(freq: number, t: number, dur: number): void {
  const ctx = ensureAudioGraph();
  const amp = ctx.createGain();
  amp.connect(getMasterGain()!);
  [
    { m: 1, v: 0.35 },
    { m: 2, v: 0.25 },
    { m: 3, v: 0.15 },
    { m: 4, v: 0.1 },
    { m: 6, v: 0.06 },
  ].forEach(({ m, v }) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq * m;
    const g = ctx.createGain();
    g.gain.value = v;
    o.connect(g);
    g.connect(amp);
    o.start(t);
    o.stop(t + dur + 0.06);
  });
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.55, t + 0.012);
  amp.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05);
}

function voiceBells(freq: number, t: number, dur: number): void {
  const ctx = ensureAudioGraph();
  const amp = ctx.createGain();
  amp.connect(getMasterGain()!);
  [
    { r: 1, v: 0.5, d: dur + 1.5 },
    { r: 2.76, v: 0.25, d: dur * 0.6 },
    { r: 5.4, v: 0.15, d: dur * 0.4 },
  ].forEach(({ r, v, d }) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq * r;
    const g = ctx.createGain();
    g.gain.setValueAtTime(v * 0.45, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(amp);
    o.start(t);
    o.stop(t + d + 0.1);
  });
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(1, t + 0.002);
}

function voicePluck(freq: number, t: number): void {
  const ctx = ensureAudioGraph();
  const amp = ctx.createGain();
  amp.connect(getMasterGain()!);
  const o = ctx.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = freq;
  o.connect(amp);
  o.start(t);
  o.stop(t + 1.0);
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.7, t + 0.003);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
}

function voiceBass(freq: number, t: number, dur: number): void {
  const ctx = ensureAudioGraph();
  const bf = freq / 2;
  const amp = ctx.createGain();
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = bf;
  osc.connect(amp);
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 500;
  amp.connect(f);
  f.connect(getMasterGain()!);
  amp.gain.setValueAtTime(0.9, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(dur * 0.5, 1.0));
  osc.start(t);
  osc.stop(t + dur + 0.1);
}

function voiceEPiano(freq: number, t: number, dur: number): void {
  const ctx = ensureAudioGraph();
  const amp = ctx.createGain();
  amp.connect(getMasterGain()!);
  const car = ctx.createOscillator();
  car.type = "sine";
  car.frequency.value = freq;
  const mod = ctx.createOscillator();
  const mg = ctx.createGain();
  mod.frequency.value = freq * 14;
  mg.gain.setValueAtTime(freq * 5, t);
  mg.gain.exponentialRampToValueAtTime(freq * 0.5, t + 0.3);
  mod.connect(mg);
  mg.connect(car.frequency);
  car.connect(amp);
  mod.start(t);
  car.start(t);
  mod.stop(t + dur + 0.4);
  car.stop(t + dur + 0.4);
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.38, t + 0.007);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.35);
}

export function playVoice(inst: string, freq: number, t: number, dur: number): void {
  switch (inst) {
    case "piano":  voicePiano(freq, t, dur); break;
    case "synth":  voiceSynth(freq, t, dur); break;
    case "pad":    voicePad(freq, t, dur); break;
    case "organ":  voiceOrgan(freq, t, dur); break;
    case "bells":  voiceBells(freq, t, dur); break;
    case "pluck":  voicePluck(freq, t); break;
    case "bass":   voiceBass(freq, t, dur); break;
    case "epiano": voiceEPiano(freq, t, dur); break;
    default:       voicePiano(freq, t, dur);
  }
}
