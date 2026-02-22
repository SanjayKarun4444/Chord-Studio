import type { ProgressionFeatures } from "./analyzer";

/**
 * Suggests a drum intensity (0-1) based on progression features.
 * Dense melody -> lower drum intensity to avoid cluttering.
 * Sparse melody -> higher drum intensity to fill space.
 * High harmonic complexity -> slightly lower intensity.
 */
export function suggestIntensity(features: ProgressionFeatures): number {
  // Base intensity from mood
  let base = 0.7;

  const moodIntensityMap: Record<string, number> = {
    chill: 0.45,
    sad: 0.5,
    smooth: 0.5,
    dreamy: 0.4,
    romantic: 0.45,
    dark: 0.65,
    groovy: 0.7,
    happy: 0.75,
    uplifting: 0.75,
    energetic: 0.85,
    aggressive: 0.9,
    intense: 0.9,
  };

  if (features.mood && moodIntensityMap[features.mood]) {
    base = moodIntensityMap[features.mood];
  }

  // Adjust for melody density: dense melody = lower drums
  const densityAdjust = -0.2 * features.rhythmicDensity;

  // Adjust for harmonic complexity: complex chords = slightly softer drums
  const complexityAdjust = -0.1 * features.harmonicComplexity;

  // BPM influence: very fast tempos may benefit from slightly lower intensity
  let bpmAdjust = 0;
  if (features.bpm > 160) bpmAdjust = -0.05;
  else if (features.bpm < 80) bpmAdjust = -0.05;

  const result = base + densityAdjust + complexityAdjust + bpmAdjust;
  return Math.max(0.2, Math.min(1.0, result));
}
