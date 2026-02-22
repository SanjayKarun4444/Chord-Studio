import type { Progression, MelodyNote } from "@/lib/types";
import { PATTERN_LIBRARY } from "../pattern-library";
import { analyzeProgression } from "./analyzer";
import { scorePatterns } from "./scorer";
import { suggestIntensity } from "./intensity-adapter";
import type { PatternScore } from "./scorer";

export type { ProgressionFeatures } from "./analyzer";
export type { PatternScore, ScoreBreakdown } from "./scorer";
export { analyzeProgression } from "./analyzer";
export { scorePatterns } from "./scorer";
export { suggestIntensity } from "./intensity-adapter";

export interface RecommendationResult {
  scores: PatternScore[];
  suggestedIntensity: number;
}

/**
 * Convenience function: recommend top-N drum patterns for a progression.
 */
export function recommendPatterns(
  progression: Progression,
  melodyNotes?: MelodyNote[],
  topN: number = 3,
): RecommendationResult {
  const features = analyzeProgression(progression, melodyNotes);
  const allScores = scorePatterns(PATTERN_LIBRARY, features);
  const suggestedIntensity = suggestIntensity(features);

  return {
    scores: allScores.slice(0, topN),
    suggestedIntensity,
  };
}
