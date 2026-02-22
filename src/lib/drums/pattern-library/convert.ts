import type { DrumPattern } from "@/lib/types";
import type { StepGridPattern, ConversionOptions, PatternTrackId } from "./types";

const DRUM_TYPE_MAP: Record<PatternTrackId, keyof DrumPattern> = {
  kick: "kicks",
  snare: "snares",
  hihat: "hihats",
  clap: "claps",
  ohat: "ohats",
};

const VEL_KEY_MAP: Record<PatternTrackId, keyof DrumPattern> = {
  kick: "kickVels",
  snare: "snareVels",
  hihat: "hihatVels",
  clap: "clapVels",
  ohat: "ohatVels",
};

/**
 * Converts a StepGridPattern to the existing DrumPattern format
 * consumed by the scheduler (beat-position arrays with velocity arrays).
 */
export function stepGridToDrumPattern(
  pattern: StepGridPattern,
  options: ConversionOptions = {},
): DrumPattern {
  const {
    intensityScale = 1.0,
    humanize = false,
    humanizeAmount = 0.5,
    swingPercent = 0,
    applyProbability = false,
  } = options;

  const { stepsPerBeat, totalSteps, timeSignature } = pattern;
  const patternLengthBeats = timeSignature.numerator;
  const stepDurationBeats = 1 / stepsPerBeat;

  const result: DrumPattern = {
    patternLengthBeats,
    kicks: [],
    snares: [],
    hihats: [],
    claps: [],
    ohats: [],
    kickVels: [],
    snareVels: [],
    hihatVels: [],
    clapVels: [],
    ohatVels: [],
  };

  const trackIds: PatternTrackId[] = ["kick", "snare", "hihat", "clap", "ohat"];

  for (const trackId of trackIds) {
    const track = pattern.tracks[trackId];
    const posKey = DRUM_TYPE_MAP[trackId] as keyof Pick<DrumPattern, "kicks" | "snares" | "hihats" | "claps" | "ohats">;
    const velKey = VEL_KEY_MAP[trackId] as keyof Pick<DrumPattern, "kickVels" | "snareVels" | "hihatVels" | "clapVels" | "ohatVels">;

    const positions: number[] = [];
    const velocities: number[] = [];

    for (let step = 0; step < Math.min(track.steps.length, totalSteps); step++) {
      const { velocity, probability } = track.steps[step];
      if (velocity <= 0) continue;

      // Probability gating
      if (applyProbability && probability < 1.0) {
        if (Math.random() > probability) continue;
      }

      // Base beat position
      let beatPos = step * stepDurationBeats;

      // Swing: shift off-beat steps (odd steps in 16th grid)
      if (swingPercent > 0 && stepsPerBeat === 4) {
        const isOffBeat = step % 2 === 1;
        if (isOffBeat) {
          const swingOffset = (swingPercent / 100) * stepDurationBeats * 0.5;
          beatPos += swingOffset;
        }
      }

      // Humanize: add timing jitter and velocity randomization
      let finalVelocity = velocity * intensityScale;
      if (humanize) {
        const timingJitter = (Math.random() - 0.5) * 2 * stepDurationBeats * 0.15 * humanizeAmount;
        beatPos += timingJitter;
        beatPos = Math.max(0, beatPos); // don't go before bar start

        const velJitter = (Math.random() - 0.5) * 2 * 0.08 * humanizeAmount;
        finalVelocity = Math.max(0.05, Math.min(1.0, finalVelocity + velJitter));
      }

      finalVelocity = Math.max(0.05, Math.min(1.0, finalVelocity));

      positions.push(parseFloat(beatPos.toFixed(4)));
      velocities.push(parseFloat(finalVelocity.toFixed(3)));
    }

    (result[posKey] as number[]) = positions;
    (result[velKey] as number[]) = velocities;
  }

  return result;
}
