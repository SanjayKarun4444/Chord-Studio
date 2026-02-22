export interface DrumPattern {
  patternLengthBeats: number;
  kicks: number[];
  snares: number[];
  hihats: number[];
  claps: number[];
  ohats: number[];
  kickVels?: number[];
  snareVels?: number[];
  hihatVels?: number[];
  clapVels?: number[];
  ohatVels?: number[];
  // Extended drum types (optional for backward compat)
  crashes?: number[];
  rides?: number[];
  highToms?: number[];
  midToms?: number[];
  floorToms?: number[];
  crashVels?: number[];
  rideVels?: number[];
  highTomVels?: number[];
  midTomVels?: number[];
  floorTomVels?: number[];
}

export interface Progression {
  chords: string[];
  tempo: number;
  key: string;
  genre: string;
  mood: string;
  bars?: number;
  description?: string;
  harmonicFunction?: string[];
  swing: number;
  drums: DrumPattern;
  label?: string;
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export interface Instrument {
  id: string;
  label: string;
  icon: string;
}

export interface QuickTag {
  label: string;
  prompt: string;
}

export interface PianoKey {
  type: "white" | "black";
  note: string;
  midi: number;
  whiteIdx?: number;
  afterWhite?: number;
}

export interface MelodyNote {
  bar: number;
  beatOffset: number;
  midi: number;
  durationBeats: number;
}

export interface MidiEvent {
  tick: number;
  note: number;
  vel: number;
  type: "on" | "off";
}

export interface MidiTrack {
  id: string;
  icon: string;
  label: string;
  detail: string;
  generate: () => Uint8Array;
}
