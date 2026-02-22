import { createChannelStrip, type ChannelStrip } from "./audio-buses";
import { createSaturator } from "./effects";

let _audioCtx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _reverbGain: GainNode | null = null;

// Bus channel strips
let _instrumentBus: ChannelStrip | null = null;
let _bassBus: ChannelStrip | null = null;
let _drumBus: ChannelStrip | null = null;
let _melodyBus: ChannelStrip | null = null;

// Bass saturator node (inserted on bass bus)
let _bassSaturator: WaveShaperNode | null = null;

// Hat stereo panner (routes hi-hats for stereo width)
let _hatPanner: StereoPannerNode | null = null;

// Drum mid-scoop EQ (reduces 1-4kHz masking when melody plays)
let _drumMidScoop: BiquadFilterNode | null = null;

export function getAudioCtx(): AudioContext {
  if (!_audioCtx)
    _audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return _audioCtx;
}

function buildReverbIR(ctx: AudioContext, duration = 2.2, decay = 3): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = sr * duration;
  const buf = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

export function ensureAudioGraph(): AudioContext {
  const ctx = getAudioCtx();
  if (_masterGain) return ctx;

  _masterGain = ctx.createGain();
  _masterGain.gain.value = 0.8;

  // Reverb with HPF to keep kick/bass out of reverb tail
  const reverbHPF = ctx.createBiquadFilter();
  reverbHPF.type = "highpass";
  reverbHPF.frequency.value = 200;
  reverbHPF.Q.value = 0.7;

  const reverb = ctx.createConvolver();
  reverb.buffer = buildReverbIR(ctx);
  _reverbGain = ctx.createGain();
  _reverbGain.gain.value = 0.15;

  // Limiter — knee 4 for more transparent limiting on sustained pads
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -2;
  limiter.knee.value = 4;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.1;

  _masterGain.connect(limiter);
  limiter.connect(ctx.destination);
  _masterGain.connect(reverbHPF);
  reverbHPF.connect(reverb);
  reverb.connect(_reverbGain);
  _reverbGain.connect(limiter);

  // ─── Bus Architecture ───

  // Instrument bus: HPF 80Hz, gain 0.65
  _instrumentBus = createChannelStrip(ctx, _masterGain, {
    gain: 0.65,
    eqType: "highpass",
    eqFreq: 80,
    eqQ: 0.7,
    pan: 0,
  });

  // Bass bus: LPF 280Hz, gain 0.7, saturator inserted
  _bassBus = createChannelStrip(ctx, _masterGain, {
    gain: 0.7,
    eqType: "lowpass",
    eqFreq: 280,
    eqQ: 0.5,
    pan: 0,
  });

  // Insert saturator on bass bus between eq and panner
  // Reconnect: eq → saturator → panner (instead of eq → panner)
  _bassBus.eq.disconnect();
  _bassSaturator = createSaturator(ctx, 3);
  _bassBus.eq.connect(_bassSaturator);
  _bassSaturator.connect(_bassBus.panner);

  // Drum bus: Peak +2dB @ 3.5kHz, compressor, gain 0.6
  _drumBus = createChannelStrip(ctx, _masterGain, {
    gain: 0.6,
    eqType: "peaking",
    eqFreq: 3500,
    eqQ: 0.8,
    eqGain: 2,
    compressor: {
      threshold: -12,
      ratio: 4,
      attack: 0.005,
      release: 0.08,
    },
    pan: 0,
  });

  // Hat stereo panner: routes hi-hats through a dedicated panner for stereo width
  _hatPanner = ctx.createStereoPanner();
  _hatPanner.pan.value = 0;  // default center, mix engine adjusts
  _hatPanner.connect(_drumBus.input);

  // Mid-scoop EQ on drum bus: peaking at 2.5kHz, default gain 0 (inactive)
  // Inserted between drum bus compressor and panner
  _drumMidScoop = ctx.createBiquadFilter();
  _drumMidScoop.type = "peaking";
  _drumMidScoop.frequency.value = 2500;
  _drumMidScoop.Q.value = 1.2;
  _drumMidScoop.gain.value = 0;

  // Re-route: compressor → midScoop → panner (instead of compressor → panner)
  if (_drumBus.compressor) {
    _drumBus.compressor.disconnect();
    _drumBus.compressor.connect(_drumMidScoop);
    _drumMidScoop.connect(_drumBus.panner);
  } else {
    _drumBus.eq.disconnect();
    _drumBus.eq.connect(_drumMidScoop);
    _drumMidScoop.connect(_drumBus.panner);
  }

  // Melody bus: HPF 200Hz, gain 0.5, panned slight right
  _melodyBus = createChannelStrip(ctx, _masterGain, {
    gain: 0.5,
    eqType: "highpass",
    eqFreq: 200,
    eqQ: 0.7,
    pan: 0.15,
  });

  return ctx;
}

export function getMasterGain(): GainNode | null {
  return _masterGain;
}

// ─── Bus Getters ───

export function getInstrumentBus(): ChannelStrip | null {
  return _instrumentBus;
}

export function getBassBus(): ChannelStrip | null {
  return _bassBus;
}

export function getDrumBus(): ChannelStrip | null {
  return _drumBus;
}

export function getMelodyBus(): ChannelStrip | null {
  return _melodyBus;
}

// Aliases for backward compatibility
export function getDrumGain(): GainNode | null {
  return _drumBus?.input ?? null;
}

export function getMelodyGain(): GainNode | null {
  return _melodyBus?.input ?? null;
}

export function setMasterVol(v: number): void {
  if (_masterGain)
    _masterGain.gain.setTargetAtTime(v, getAudioCtx().currentTime, 0.02);
}

export function setMelodyVol(v: number): void {
  if (_melodyBus)
    _melodyBus.output.gain.setTargetAtTime(v, getAudioCtx().currentTime, 0.02);
}

// ─── Mix Engine Nodes ───

export function getHatPanner(): StereoPannerNode | null {
  return _hatPanner;
}

export function getDrumMidScoop(): BiquadFilterNode | null {
  return _drumMidScoop;
}
