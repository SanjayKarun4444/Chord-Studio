export type DrumType = "kick" | "snare" | "hihat" | "ohat" | "clap";
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
  drums: Record<DrumType, SampleEntry[]>;  // 2-4 round-robin variations
}

export interface SamplePlayOptions {
  velocity?: number;
  pitchCents?: number;
  timingOffsetSec?: number;
}
