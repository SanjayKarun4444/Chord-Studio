import type { DrumType } from "@/lib/audio/drums/types";

export interface DrumPieceConfig {
  type: DrumType;
  x: number;
  y: number;
  label: string;
  animClass: string;
  animDuration: number; // ms
}

export const DRUM_PIECE_CONFIG: DrumPieceConfig[] = [
  // Cymbals (top row)
  { type: "crash",     x: 130, y: 45,  label: "Crash",     animClass: "drum-hit-crash", animDuration: 250 },
  { type: "ride",      x: 670, y: 45,  label: "Ride",      animClass: "drum-hit-ride",  animDuration: 180 },
  // Hi-hats (left)
  { type: "hihat",     x: 100, y: 170, label: "Hi-Hat",    animClass: "drum-hit-hihat", animDuration: 120 },
  { type: "ohat",      x: 100, y: 250, label: "Open Hat",  animClass: "drum-hit-ohat",  animDuration: 200 },
  // Toms (center-top)
  { type: "high_tom",  x: 310, y: 100, label: "High Tom",  animClass: "drum-hit-tom",   animDuration: 160 },
  { type: "mid_tom",   x: 490, y: 100, label: "Mid Tom",   animClass: "drum-hit-tom",   animDuration: 160 },
  // Snare (center-left)
  { type: "snare",     x: 280, y: 240, label: "Snare",     animClass: "drum-hit-snare", animDuration: 150 },
  // Kick (center-bottom)
  { type: "kick",      x: 400, y: 320, label: "Kick",      animClass: "drum-hit-kick",  animDuration: 180 },
  // Floor tom (right)
  { type: "floor_tom", x: 620, y: 250, label: "Floor Tom", animClass: "drum-hit-tom",   animDuration: 160 },
  // Clap (bottom-right)
  { type: "clap",      x: 700, y: 330, label: "Clap",      animClass: "drum-hit-clap",  animDuration: 140 },
];

/** Left column: hi-hat/snare side (matches real kit ergonomics) */
export const LEFT_COLUMN_PIECES: DrumPieceConfig[] = [
  { type: "crash", x: 0, y: 0, label: "Crash",    animClass: "drum-hit-crash", animDuration: 250 },
  { type: "hihat", x: 0, y: 0, label: "Hi-Hat",   animClass: "drum-hit-hihat", animDuration: 120 },
  { type: "ohat",  x: 0, y: 0, label: "Open Hat", animClass: "drum-hit-ohat",  animDuration: 200 },
  { type: "snare", x: 0, y: 0, label: "Snare",    animClass: "drum-hit-snare", animDuration: 150 },
  { type: "kick",  x: 0, y: 0, label: "Kick",     animClass: "drum-hit-kick",  animDuration: 180 },
];

/** Right column: ride/floor side */
export const RIGHT_COLUMN_PIECES: DrumPieceConfig[] = [
  { type: "ride",      x: 0, y: 0, label: "Ride",      animClass: "drum-hit-ride", animDuration: 180 },
  { type: "high_tom",  x: 0, y: 0, label: "High Tom",  animClass: "drum-hit-tom",  animDuration: 160 },
  { type: "mid_tom",   x: 0, y: 0, label: "Mid Tom",   animClass: "drum-hit-tom",  animDuration: 160 },
  { type: "floor_tom", x: 0, y: 0, label: "Floor Tom", animClass: "drum-hit-tom",  animDuration: 160 },
  { type: "clap",      x: 0, y: 0, label: "Clap",      animClass: "drum-hit-clap", animDuration: 140 },
];
