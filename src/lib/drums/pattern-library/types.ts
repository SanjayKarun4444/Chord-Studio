export interface StepData {
  velocity: number;    // 0-1
  probability: number; // 0-1, 1 = always plays
}

export interface StepTrack {
  steps: StepData[];
}

export type CoreTrackId = "kick" | "snare" | "hihat" | "clap" | "ohat";
export type ExtendedTrackId = "crash" | "ride" | "high_tom" | "mid_tom" | "floor_tom";
export type PatternTrackId = CoreTrackId | ExtendedTrackId;

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface StepGridPattern {
  id: string;
  name: string;
  genreTags: string[];
  category: "rock-pop" | "hip-hop" | "electronic" | "latin" | "jazz-world" | "misc";
  timeSignature: TimeSignature;
  bpmRange: [number, number];
  swingCapable: boolean;
  stepsPerBeat: number;   // 4 = 16th grid, 3 = triplet grid
  totalSteps: number;     // numerator * stepsPerBeat
  tracks: Record<CoreTrackId, StepTrack> & Partial<Record<ExtendedTrackId, StepTrack>>;
  metadata?: {
    description?: string;
    difficulty?: "basic" | "intermediate" | "advanced";
    intensityRange?: [number, number];
  };
}

export interface ConversionOptions {
  intensityScale?: number;    // 0-1, multiplies velocities
  humanize?: boolean;
  humanizeAmount?: number;    // 0-1, default 0.5
  swingPercent?: number;      // 0-100
  applyProbability?: boolean; // gate steps by probability field
}
