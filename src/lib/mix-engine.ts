import {
  getAudioCtx,
  getDrumBus,
  getDrumMidScoop,
  getHatPanner,
} from "./audio-engine";

export interface MixState {
  drumIntensity: number;      // 0-1
  melodyPriority: boolean;    // engage mid-scoop on drums when melody plays
  autoMix: boolean;           // auto-adjust intensity from analyzer
  drumBusVolume: number;      // 0-1, user override
  hatStereoWidth: number;     // 0-1, maps to pan +-0.4
}

const DEFAULT_MIX_STATE: MixState = {
  drumIntensity: 0.7,
  melodyPriority: true,
  autoMix: true,
  drumBusVolume: 0.6,
  hatStereoWidth: 0.25,
};

let _state: MixState = { ...DEFAULT_MIX_STATE };

export function getMixState(): MixState {
  return { ..._state };
}

/**
 * Update mix state and apply changes to audio nodes.
 */
export function updateMixState(partial: Partial<MixState>): void {
  _state = { ..._state, ...partial };
  applyMixState();
}

/**
 * Apply current mix state to audio graph nodes.
 */
export function applyMixState(): void {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  // Drum bus volume: map intensity 0-1 to roughly -12dB to -6dB
  // Using linear gain: 0.25 (-12dB) to 0.5 (-6dB) range, scaled by drumBusVolume
  const drumBus = getDrumBus();
  if (drumBus) {
    const intensityGain = 0.25 + _state.drumIntensity * 0.35;
    const finalGain = intensityGain * (_state.drumBusVolume / 0.6); // normalize around default 0.6
    drumBus.output.gain.setTargetAtTime(
      Math.max(0, Math.min(1, finalGain)),
      now,
      0.05,
    );
  }

  // Mid-frequency scoop for melody priority
  const midScoop = getDrumMidScoop();
  if (midScoop) {
    const scoopGain = _state.melodyPriority ? -4 : 0;
    midScoop.gain.setTargetAtTime(scoopGain, now, 0.1);
  }

  // Hat stereo width
  const hatPanner = getHatPanner();
  if (hatPanner) {
    // Alternate hat panning left/right based on width setting
    // We set a base pan; actual alternation happens per-hit in the future
    hatPanner.pan.setTargetAtTime(_state.hatStereoWidth, now, 0.05);
  }

  // Drum bus compressor: adjust attack/release for transient control
  if (drumBus?.compressor) {
    // Higher intensity = faster attack (more punchy), lower = softer
    const attack = 0.003 + (1 - _state.drumIntensity) * 0.012;
    const release = 0.06 + (1 - _state.drumIntensity) * 0.06;
    drumBus.compressor.attack.setTargetAtTime(attack, now, 0.05);
    drumBus.compressor.release.setTargetAtTime(release, now, 0.05);
  }
}

/**
 * Set drum intensity and re-apply mix.
 */
export function setDrumIntensity(intensity: number): void {
  updateMixState({ drumIntensity: Math.max(0, Math.min(1, intensity)) });
}

/**
 * Toggle melody priority (mid-scoop on drums).
 */
export function setMelodyPriority(on: boolean): void {
  updateMixState({ melodyPriority: on });
}

/**
 * Set hat stereo width (0 = mono center, 1 = wide).
 */
export function setHatStereoWidth(width: number): void {
  updateMixState({ hatStereoWidth: Math.max(0, Math.min(1, width)) });
}
