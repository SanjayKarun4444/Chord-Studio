"use client";

import { useMemo } from "react";
import type { Progression, MelodyNote } from "@/lib/types";
import { recommendPatterns, type RecommendationResult } from "@/lib/drums/recommendation";

/**
 * Returns top drum pattern recommendations for the current progression.
 * Memoized so it only recalculates when the progression changes.
 */
export function useDrumRecommendations(
  progression: Progression | null,
  melodyNotes?: MelodyNote[],
  topN: number = 3,
): RecommendationResult | null {
  return useMemo(() => {
    if (!progression) return null;
    return recommendPatterns(progression, melodyNotes, topN);
  }, [
    progression?.genre,
    progression?.mood,
    progression?.tempo,
    progression?.key,
    progression?.swing,
    progression?.chords?.join(","),
    melodyNotes?.length,
    topN,
  ]);
}
