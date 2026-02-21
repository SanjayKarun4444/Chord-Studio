let _audioCtx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _drumGain: GainNode | null = null;
let _reverbGain: GainNode | null = null;
let _melodyGain: GainNode | null = null;

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

  const reverb = ctx.createConvolver();
  reverb.buffer = buildReverbIR(ctx);
  _reverbGain = ctx.createGain();
  _reverbGain.gain.value = 0.15;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -2;
  limiter.knee.value = 2;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.1;

  _masterGain.connect(limiter);
  limiter.connect(ctx.destination);
  _masterGain.connect(reverb);
  reverb.connect(_reverbGain);
  _reverbGain.connect(limiter);

  _drumGain = ctx.createGain();
  _drumGain.gain.value = 0.6;
  _drumGain.connect(_masterGain);

  _melodyGain = ctx.createGain();
  _melodyGain.gain.value = 0.55;
  _melodyGain.connect(_masterGain);

  return ctx;
}

export function getMasterGain(): GainNode | null {
  return _masterGain;
}

export function getDrumGain(): GainNode | null {
  return _drumGain;
}

export function getMelodyGain(): GainNode | null {
  return _melodyGain;
}

export function setMasterVol(v: number): void {
  if (_masterGain)
    _masterGain.gain.setTargetAtTime(v, getAudioCtx().currentTime, 0.02);
}

export function setMelodyVol(v: number): void {
  if (_melodyGain)
    _melodyGain.gain.setTargetAtTime(v, getAudioCtx().currentTime, 0.02);
}
