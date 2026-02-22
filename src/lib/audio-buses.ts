export interface ChannelStrip {
  input: GainNode;
  eq: BiquadFilterNode;
  compressor: DynamicsCompressorNode | null;
  panner: StereoPannerNode;
  output: GainNode;
}

export interface ChannelStripOptions {
  gain: number;
  eqType: BiquadFilterType;
  eqFreq: number;
  eqQ: number;
  eqGain?: number;
  compressor?: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  pan: number;
}

export function createChannelStrip(
  ctx: AudioContext,
  dest: AudioNode,
  opts: ChannelStripOptions,
): ChannelStrip {
  const input = ctx.createGain();
  input.gain.value = 1;

  const eq = ctx.createBiquadFilter();
  eq.type = opts.eqType;
  eq.frequency.value = opts.eqFreq;
  eq.Q.value = opts.eqQ;
  if (opts.eqGain !== undefined) eq.gain.value = opts.eqGain;

  let compressor: DynamicsCompressorNode | null = null;
  if (opts.compressor) {
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = opts.compressor.threshold;
    compressor.ratio.value = opts.compressor.ratio;
    compressor.attack.value = opts.compressor.attack;
    compressor.release.value = opts.compressor.release;
  }

  const panner = ctx.createStereoPanner();
  panner.pan.value = opts.pan;

  const output = ctx.createGain();
  output.gain.value = opts.gain;

  // Chain: input → eq → [compressor] → panner → output → dest
  input.connect(eq);
  if (compressor) {
    eq.connect(compressor);
    compressor.connect(panner);
  } else {
    eq.connect(panner);
  }
  panner.connect(output);
  output.connect(dest);

  return { input, eq, compressor, panner, output };
}
