import type { Progression, MelodyNote } from "@/lib/types";
import type { TimeSignature } from "../pattern-library/types";

export interface ProgressionFeatures {
  bpm: number;
  timeSignature: TimeSignature;
  genre: string;
  genreConfidence: number;         // 0-1
  rhythmicDensity: number;         // 0-1, melody notes per bar normalized
  syncopationScore: number;        // 0-1, fraction of off-beat melody notes
  harmonicComplexity: number;      // 0-1, ratio of extended chords
  swingAmount: number;             // 0-100
  keyMode: "major" | "minor";
  mood: string;
}

const EXTENDED_CHORD_PATTERNS = /(?:maj7|min7|m7|7|9|11|13|dim|aug|sus|add|6|\+|°|ø)/i;

function isOffBeat(beatOffset: number): boolean {
  // Off-beat = not on a quarter-note boundary
  const rem = beatOffset % 1;
  return rem > 0.1 && rem < 0.9;
}

function parseKeyMode(key: string): "major" | "minor" {
  const lower = key.toLowerCase();
  if (lower.includes("minor") || lower.includes("min") || lower.endsWith("m")) return "minor";
  return "major";
}

/**
 * Extracts musical features from a Progression + optional melody notes
 * for use by the pattern recommendation scorer.
 */
export function analyzeProgression(
  progression: Progression,
  melodyNotes?: MelodyNote[],
): ProgressionFeatures {
  const bpm = progression.tempo || 120;
  const genre = (progression.genre || "").toLowerCase().trim();
  const mood = (progression.mood || "").toLowerCase().trim();
  const swingAmount = progression.swing || 0;
  const keyMode = parseKeyMode(progression.key || "C major");

  // Time signature: default 4/4 (expandable in future)
  const timeSignature: TimeSignature = { numerator: 4, denominator: 4 };

  // Genre confidence: if genre is set and non-empty, high confidence
  const genreConfidence = genre.length > 0 ? 0.9 : 0.1;

  // Harmonic complexity: ratio of extended chords
  const chords = progression.chords || [];
  const extendedCount = chords.filter((c) => EXTENDED_CHORD_PATTERNS.test(c)).length;
  const harmonicComplexity = chords.length > 0 ? extendedCount / chords.length : 0;

  // Rhythmic density and syncopation from melody
  let rhythmicDensity = 0;
  let syncopationScore = 0;
  const totalBars = progression.bars || chords.length || 4;

  if (melodyNotes && melodyNotes.length > 0) {
    const notesPerBar = melodyNotes.length / totalBars;
    // Normalize: 0 notes = 0, 8+ notes per bar = 1
    rhythmicDensity = Math.min(1, notesPerBar / 8);

    const offBeatNotes = melodyNotes.filter((n) => isOffBeat(n.beatOffset));
    syncopationScore = offBeatNotes.length / melodyNotes.length;
  }

  return {
    bpm,
    timeSignature,
    genre,
    genreConfidence,
    rhythmicDensity,
    syncopationScore,
    harmonicComplexity,
    swingAmount,
    keyMode,
    mood,
  };
}
