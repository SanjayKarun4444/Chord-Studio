import type { DrumPattern } from "@/lib/types";
import type { StepGridPattern, ConversionOptions, PatternTrackId } from "./types";

const DRUM_TYPE_MAP: Record<PatternTrackId, keyof DrumPattern> = {
  kick: "kicks",
  snare: "snares",
  hihat: "hihats",
  clap: "claps",
  ohat: "ohats",
  crash: "crashes",
  ride: "rides",
  high_tom: "highToms",
  mid_tom: "midToms",
  floor_tom: "floorToms",
};

const VEL_KEY_MAP: Record<PatternTrackId, keyof DrumPattern> = {
  kick: "kickVels",
  snare: "snareVels",
  hihat: "hihatVels",
  clap: "clapVels",
  ohat: "ohatVels",
  crash: "crashVels",
  ride: "rideVels",
  high_tom: "highTomVels",
  mid_tom: "midTomVels",
  floor_tom: "floorTomVels",
};

const ALL_TRACK_IDS: PatternTrackId[] = [
  "kick", "snare", "hihat", "clap", "ohat",
  "crash", "ride", "high_tom", "mid_tom", "floor_tom",
];

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

  for (const trackId of ALL_TRACK_IDS) {
    const track = pattern.tracks[trackId as keyof typeof pattern.tracks];
    if (!track) continue; // skip extended tracks not present in this pattern

    const posKey = DRUM_TYPE_MAP[trackId];
    const velKey = VEL_KEY_MAP[trackId];

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
