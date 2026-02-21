import type { Instrument, QuickTag, Progression } from "./types";

export const INSTRUMENT_COLORS: Record<string, string> = {
  piano: "#FFD166",
  synth: "#FF6B9D",
  bass: "#4ECDC4",
  pad: "#A855F7",
  pluck: "#22D3EE",
  organ: "#F97316",
  epiano: "#84CC16",
  bells: "#E879F9",
};

export const INSTRUMENTS: Instrument[] = [
  { id: "piano", label: "Piano", icon: "\u2B1C" },
  { id: "synth", label: "Synth", icon: "\u25C8" },
  { id: "bass", label: "Bass", icon: "\u25C9" },
  { id: "pad", label: "Pad", icon: "\u25CE" },
  { id: "pluck", label: "Pluck", icon: "\u25C7" },
  { id: "organ", label: "Organ", icon: "\u2B21" },
  { id: "epiano", label: "E.Piano", icon: "\u25C6" },
  { id: "bells", label: "Bells", icon: "\u25EC" },
];

export const QUICK_TAGS: QuickTag[] = [
  { label: "Dark Trap", prompt: "Create a dark trap beat in C minor at 140 BPM" },
  { label: "Sad R&B", prompt: "Make a sad R&B progression in A minor at 75 BPM" },
  { label: "Uplifting Hip Hop", prompt: "Generate uplifting hip hop chords in F major" },
  { label: "Chill Lo-Fi", prompt: "Chill lo-fi study vibes in F major at 85 BPM" },
  { label: "Jazz Fusion", prompt: "Jazz fusion in D minor with swing at 100 BPM" },
  { label: "Gospel Soul", prompt: "Gospel soul progression in Bb major at 95 BPM" },
  { label: "Neo-Soul", prompt: "Neo-soul chords in E minor, smooth and soulful" },
  { label: "Drill", prompt: "Dark UK drill chords in F# minor at 144 BPM" },
];

export const DEFAULT_PROGRESSIONS: Progression[] = [
  {
    label: "Dark Trap",
    tempo: 140,
    key: "C minor",
    genre: "trap",
    mood: "dark",
    swing: 0,
    chords: ["Cm", "Ab", "Bb", "G"],
    drums: {
      patternLengthBeats: 4,
      kicks: [0, 2],
      snares: [1, 3],
      hihats: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
      claps: [],
      ohats: [],
    },
  },
  {
    label: "Chill Lo-Fi",
    tempo: 85,
    key: "F major",
    genre: "lofi",
    mood: "chill",
    swing: 60,
    chords: ["Fmaj7", "Dm7", "Gm7", "C7"],
    drums: {
      patternLengthBeats: 4,
      kicks: [0, 2.5],
      snares: [1, 3],
      hihats: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
      claps: [],
      ohats: [0.5, 2.5],
    },
  },
  {
    label: "Sad R&B",
    tempo: 75,
    key: "A minor",
    genre: "rnb",
    mood: "sad",
    swing: 30,
    chords: ["Am7", "Fmaj7", "C", "G"],
    drums: {
      patternLengthBeats: 4,
      kicks: [0, 2],
      snares: [1, 3],
      hihats: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
      claps: [1, 3],
      ohats: [],
    },
  },
  {
    label: "Jazz Fusion",
    tempo: 100,
    key: "D minor",
    genre: "jazz",
    mood: "smooth",
    swing: 70,
    chords: ["Dm7", "G7", "Cmaj7", "Am7"],
    drums: {
      patternLengthBeats: 4,
      kicks: [0, 2.5],
      snares: [1, 3],
      hihats: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
      claps: [],
      ohats: [],
    },
  },
  {
    label: "Gospel Soul",
    tempo: 95,
    key: "Bb major",
    genre: "gospel",
    mood: "uplifting",
    swing: 50,
    chords: ["Bbmaj7", "Gm7", "Ebmaj7", "F7"],
    drums: {
      patternLengthBeats: 4,
      kicks: [0, 1.5, 3],
      snares: [1, 3],
      hihats: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
      claps: [1, 3],
      ohats: [],
    },
  },
];

export const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];

export const BLACK_OFFSETS: Record<string, number> = {
  "C#": 0,
  "D#": 1,
  "F#": 3,
  "G#": 4,
  "A#": 5,
};

export const NOTE_SEMITONE: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  "C#": 1, Db: 1, "D#": 3, Eb: 3, "F#": 6, Gb: 6,
  "G#": 8, Ab: 8, "A#": 10, Bb: 10,
};

export const NOTE_MIDI_MAP: Record<string, number> = {
  C: 60, "C#": 61, Db: 61, D: 62, "D#": 63, Eb: 63,
  E: 64, F: 65, "F#": 66, Gb: 66, G: 67, "G#": 68,
  Ab: 68, A: 69, "A#": 70, Bb: 70, B: 71,
};
