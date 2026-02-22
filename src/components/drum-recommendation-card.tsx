"use client";

import type { PatternScore } from "@/lib/drums/recommendation";
import DrumStepGrid from "./drum-step-grid";

interface DrumRecommendationCardProps {
  score: PatternScore;
  activeStep?: number;
  onPreview?: (patternId: string) => void;
  onApply?: (patternId: string) => void;
}

export default function DrumRecommendationCard({
  score,
  activeStep,
  onPreview,
  onApply,
}: DrumRecommendationCardProps) {
  const { pattern, score: numScore, reasoning } = score;

  return (
    <div
      className="result-appear flex flex-col gap-2 p-3 rounded-xl"
      style={{
        background: "rgba(6,6,10,0.7)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header: name + score badge */}
      <div className="flex items-center gap-2">
        <span className="font-display text-[0.95rem] text-gold tracking-[0.02em] flex-1">
          {pattern.name}
        </span>
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full font-mono text-[0.65rem] font-bold"
          style={{
            background: "rgba(6,214,160,0.15)",
            color: "var(--color-teal)",
            border: "1px solid rgba(6,214,160,0.3)",
          }}
        >
          {numScore}
        </span>
      </div>

      {/* Genre tags */}
      <div className="flex flex-wrap gap-1">
        {pattern.genreTags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full font-mono text-[0.52rem] tracking-[0.08em] uppercase"
            style={{
              background: "rgba(255,209,102,0.08)",
              color: "var(--color-text-dim)",
              border: "1px solid rgba(255,209,102,0.12)",
            }}
          >
            {tag}
          </span>
        ))}
        <span className="font-mono text-[0.5rem] text-text-dim ml-1">
          {pattern.bpmRange[0]}-{pattern.bpmRange[1]} BPM
        </span>
      </div>

      {/* Step grid preview */}
      <DrumStepGrid pattern={pattern} activeStep={activeStep} compact />

      {/* Reasoning */}
      <p className="font-mono text-[0.55rem] text-text-dim leading-relaxed">
        {reasoning}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onPreview?.(pattern.id)}
          className="flex-1 px-3 py-1.5 rounded-lg font-mono text-[0.6rem] tracking-[0.08em] uppercase cursor-pointer transition-all duration-150"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "var(--color-text-mid)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Preview
        </button>
        <button
          onClick={() => onApply?.(pattern.id)}
          className="flex-1 px-3 py-1.5 rounded-lg font-mono text-[0.6rem] tracking-[0.08em] uppercase cursor-pointer transition-all duration-150"
          style={{
            background: "var(--color-gold)",
            color: "#000",
            fontWeight: 700,
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
