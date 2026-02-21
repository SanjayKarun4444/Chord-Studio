import { ensureAudioGraph, getDrumGain } from "./audio-engine";

export function playDrum(type: string, t: number): void {
  const ctx = ensureAudioGraph();
  const drumGain = getDrumGain()!;

  if (type === "kick") {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(drumGain);
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.start(t);
    o.stop(t + 0.16);
  } else if (type === "snare") {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < buf.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    const n = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    n.buffer = buf;
    f.type = "highpass";
    f.frequency.value = 1000;
    n.connect(f);
    f.connect(g);
    g.connect(drumGain);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    n.start(t);
    n.stop(t + 0.21);
  } else if (type === "hihat") {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < buf.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    const n = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    n.buffer = buf;
    f.type = "highpass";
    f.frequency.value = 7000;
    n.connect(f);
    f.connect(g);
    g.connect(drumGain);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    n.start(t);
    n.stop(t + 0.06);
  } else if (type === "clap") {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < buf.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    const n = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    n.buffer = buf;
    f.type = "bandpass";
    f.frequency.value = 2000;
    f.Q.value = 0.7;
    n.connect(f);
    f.connect(g);
    g.connect(drumGain);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    n.start(t);
    n.stop(t + 0.11);
  }
}
