export type CoreDrumType = "kick" | "snare" | "hihat" | "ohat" | "clap";
export type ExtendedDrumType = "crash" | "ride" | "high_tom" | "mid_tom" | "floor_tom";
export type DrumType = CoreDrumType | ExtendedDrumType;

export const ALL_DRUM_TYPES: DrumType[] = [
  "kick", "snare", "hihat", "ohat", "clap",
  "crash", "ride", "high_tom", "mid_tom", "floor_tom",
];

export type PackId = "common" | "trap" | "lofi" | "boom_bap" | "drill" | "jazz" | "gospel" | "house" | "rnb" | "afrobeats" | "funk";
export type DrumEngineMode = "samples" | "synth";

export interface SampleEntry {
  url: string;          // path under /samples/drums/
  gain?: number;        // per-sample trim (default 1.0)
  pitchCents?: number;  // base pitch offset (default 0)
}

export interface PackManifest {
  id: PackId;
  label: string;
  drums: Partial<Record<DrumType, SampleEntry[]>> & Record<CoreDrumType, SampleEntry[]>;
}

export interface SamplePlayOptions {
  velocity?: number;
  pitchCents?: number;
  timingOffsetSec?: number;
}
