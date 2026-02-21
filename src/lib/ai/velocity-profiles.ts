import type { DrumPattern } from "../types";

type VelocityProfile = {
  kick: number[];
  snare: number[];
  hat: number[];
  clap: number[];
};

export const VELOCITY_PROFILES: Record<string, VelocityProfile> = {
  trap: {
    kick: [1.0, 0.55, 0.7, 0.85, 0.6],
    snare: [0.95, 0.9],
    hat: [0.85, 0.4, 0.7, 0.4, 0.9, 0.35, 0.7, 0.4],
    clap: [0.85, 0.9],
  },
  boomBap: {
    kick: [0.95, 0.65, 0.8, 0.7],
    snare: [0.9, 0.85],
    hat: [0.75, 0.5, 0.8, 0.45, 0.7, 0.5, 0.75, 0.4],
    clap: [0.7, 0.75],
  },
  drill: {
    kick: [1.0, 0.7, 0.8, 0.65, 0.75],
    snare: [0.95, 0.95],
    hat: [0.8, 0.35, 0.7, 0.35, 0.85, 0.3, 0.7, 0.35],
    clap: [0.9, 0.95],
  },
  lofi: {
    kick: [0.72, 0.62],
    snare: [0.62, 0.68],
    hat: [0.55, 0.3, 0.5, 0.3, 0.6, 0.28, 0.52, 0.35],
    clap: [0.58, 0.62],
  },
  hiphop: {
    kick: [0.9, 0.65, 0.75, 0.7],
    snare: [0.88, 0.85],
    hat: [0.75, 0.45, 0.7, 0.45, 0.8, 0.4, 0.7, 0.45],
    clap: [0.75, 0.8],
  },
  rnb: {
    kick: [0.9, 0.6, 0.75, 0.65],
    snare: [0.88, 0.9],
    hat: [0.7, 0.4, 0.65, 0.4, 0.75, 0.35, 0.65, 0.45],
    clap: [0.82, 0.85],
  },
  afrobeats: {
    kick: [0.95, 0.65, 0.8, 0.7],
    snare: [0.85, 0.8],
    hat: [0.8, 0.5, 0.75, 0.45, 0.8, 0.5, 0.7, 0.55],
    clap: [0.75, 0.7],
  },
  amapiano: {
    kick: [0.9, 0.6, 0.75],
    snare: [0.8, 0.78],
    hat: [0.7, 0.4, 0.65, 0.4, 0.75, 0.35, 0.65, 0.4],
    clap: [0.7, 0.72],
  },
  gospel: {
    kick: [0.95, 0.7, 0.8],
    snare: [0.9, 0.92],
    hat: [0.72, 0.45, 0.68, 0.4, 0.75, 0.42, 0.7, 0.48],
    clap: [0.9, 0.92],
  },
  jazz: {
    kick: [0.55, 0.45, 0.5],
    snare: [0.45, 0.4],
    hat: [0.55, 0.3, 0.5, 0.28, 0.55, 0.3, 0.48, 0.28],
    clap: [0.45, 0.45],
  },
  house: {
    kick: [1.0, 1.0, 1.0, 1.0],
    snare: [0.9, 0.9],
    hat: [0.75, 0.55, 0.75, 0.55, 0.8, 0.55, 0.75, 0.55],
    clap: [0.85, 0.9],
  },
  soul: {
    kick: [0.88, 0.65, 0.75],
    snare: [0.85, 0.88],
    hat: [0.7, 0.42, 0.66, 0.38, 0.72, 0.4, 0.65, 0.45],
    clap: [0.82, 0.85],
  },
  reggaeton: {
    kick: [1.0, 0.6, 0.85, 0.6, 0.8, 0.65],
    snare: [0.9, 0.95, 0.9, 0.95],
    hat: [
      0.7, 0.4, 0.65, 0.4, 0.75, 0.4, 0.65, 0.4, 0.7, 0.4, 0.65, 0.4, 0.75, 0.4,
      0.65, 0.4,
    ],
    clap: [0.85, 0.88],
  },
  dancehall: {
    kick: [0.95, 0.7, 0.8],
    snare: [0.88, 0.85],
    hat: [0.75, 0.45, 0.7, 0.4, 0.78, 0.42, 0.68, 0.45],
    clap: [0.8, 0.82],
  },
  funk: {
    kick: [1.0, 0.65, 0.75, 0.6, 0.7],
    snare: [0.9, 0.92],
    hat: [0.8, 0.5, 0.75, 0.45, 0.82, 0.5, 0.7, 0.48],
    clap: [0.85, 0.88],
  },
  default: {
    kick: [0.9, 0.65, 0.75],
    snare: [0.9, 0.85],
    hat: [0.75, 0.4, 0.7, 0.4, 0.8, 0.38, 0.7, 0.42],
    clap: [0.8, 0.82],
  },
};

function cycleArray(positions: number[], pattern: number[]): number[] {
  if (!Array.isArray(positions) || positions.length === 0) return [];
  return positions.map((_, i) => pattern[i % pattern.length]);
}

export function humanizeVelocities(drums: DrumPattern, genre: string): DrumPattern {
  if (!drums) return drums;
  const p = VELOCITY_PROFILES[genre] || VELOCITY_PROFILES.default;

  const jitter = (arr: number[]) =>
    arr.map((v) =>
      Math.min(1.0, Math.max(0.05, v + (Math.random() * 0.08 - 0.04))),
    );

  return {
    ...drums,
    kickVels: jitter(cycleArray(drums.kicks, p.kick)),
    snareVels: jitter(cycleArray(drums.snares, p.snare)),
    hihatVels: jitter(cycleArray(drums.hihats, p.hat)),
    clapVels: jitter(cycleArray(drums.claps || [], p.clap)),
    ohatVels: jitter(cycleArray(drums.ohats || [], p.hat)),
  };
}
