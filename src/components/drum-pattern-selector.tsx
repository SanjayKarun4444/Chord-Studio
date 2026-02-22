"use client";

import { useState, useMemo } from "react";
import type { StepGridPattern } from "@/lib/drums/pattern-library";
import { PATTERN_LIBRARY, PATTERN_CATEGORIES, PATTERN_MAP } from "@/lib/drums/pattern-library";
import type { PatternScore } from "@/lib/drums/recommendation";
import DrumStepGrid from "./drum-step-grid";
import DrumRecommendationCard from "./drum-recommendation-card";

interface DrumPatternSelectorProps {
  open: boolean;
  onClose: () => void;
  recommendations: PatternScore[];
  activeStep?: number;
  onPreview?: (patternId: string) => void;
  onApply?: (patternId: string) => void;
}

export default function DrumPatternSelector({
  open,
  onClose,
  recommendations,
  activeStep,
  onPreview,
  onApply,
}: DrumPatternSelectorProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [timeSigFilter, setTimeSigFilter] = useState<string | null>(null);

  const filteredPatterns = useMemo(() => {
    return PATTERN_LIBRARY.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(q);
        const tagMatch = p.genreTags.some((t) => t.toLowerCase().includes(q));
        if (!nameMatch && !tagMatch) return false;
      }
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (timeSigFilter) {
        const sig = `${p.timeSignature.numerator}/${p.timeSignature.denominator}`;
        if (sig !== timeSigFilter) return false;
      }
      return true;
    });
  }, [search, categoryFilter, timeSigFilter]);

  const groupedPatterns = useMemo(() => {
    const groups: Record<string, StepGridPattern[]> = {};
    for (const p of filteredPatterns) {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    }
    return groups;
  }, [filteredPatterns]);

  // Available time signatures for filter
  const availableTimeSigs = useMemo(() => {
    const sigs = new Set<string>();
    PATTERN_LIBRARY.forEach((p) => sigs.add(`${p.timeSignature.numerator}/${p.timeSignature.denominator}`));
    return Array.from(sigs);
  }, []);

  if (!open) return null;

  return (
    <div className="panel-slide-up fixed inset-x-0 bottom-0 z-50 flex flex-col" style={{ maxHeight: "60vh" }}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 -z-10" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative mx-auto w-full max-w-[920px] flex flex-col rounded-t-2xl overflow-hidden"
        style={{
          background: "rgba(8,8,12,0.96)",
          border: "1px solid var(--color-border)",
          borderBottom: "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <h3 className="font-display text-[1.1rem] text-gold tracking-[0.03em] flex-1">
            Drum Patterns
          </h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md font-mono text-[0.6rem] text-text-dim cursor-pointer transition-colors duration-150 hover:text-text"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            ESC
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ maxHeight: "calc(60vh - 54px)" }}>
          {/* Recommendations section */}
          {recommendations.length > 0 && (
            <div className="mb-5">
              <div className="font-mono text-[0.55rem] text-text-dim tracking-[0.15em] uppercase mb-2.5">
                Recommended for your progression
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map((rec) => (
                  <DrumRecommendationCard
                    key={rec.pattern.id}
                    score={rec}
                    activeStep={activeStep}
                    onPreview={onPreview}
                    onApply={onApply}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patterns..."
              className="px-3 py-1.5 rounded-lg font-mono text-[0.7rem] text-text outline-none flex-1 min-w-[150px]"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />

            {/* Category filters */}
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setCategoryFilter(null)}
                className="px-2.5 py-1 rounded-full font-mono text-[0.55rem] tracking-[0.06em] uppercase cursor-pointer transition-all duration-150"
                style={{
                  background: !categoryFilter ? "rgba(255,209,102,0.15)" : "transparent",
                  color: !categoryFilter ? "var(--color-gold)" : "var(--color-text-dim)",
                  border: `1px solid ${!categoryFilter ? "rgba(255,209,102,0.3)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                All
              </button>
              {PATTERN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                  className="px-2.5 py-1 rounded-full font-mono text-[0.55rem] tracking-[0.06em] uppercase cursor-pointer transition-all duration-150"
                  style={{
                    background: categoryFilter === cat.id ? "rgba(255,209,102,0.15)" : "transparent",
                    color: categoryFilter === cat.id ? "var(--color-gold)" : "var(--color-text-dim)",
                    border: `1px solid ${categoryFilter === cat.id ? "rgba(255,209,102,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Time sig filter */}
            <div className="flex gap-1">
              {availableTimeSigs.map((sig) => (
                <button
                  key={sig}
                  onClick={() => setTimeSigFilter(timeSigFilter === sig ? null : sig)}
                  className="px-2 py-1 rounded-full font-mono text-[0.55rem] cursor-pointer transition-all duration-150"
                  style={{
                    background: timeSigFilter === sig ? "rgba(6,214,160,0.15)" : "transparent",
                    color: timeSigFilter === sig ? "var(--color-teal)" : "var(--color-text-dim)",
                    border: `1px solid ${timeSigFilter === sig ? "rgba(6,214,160,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {sig}
                </button>
              ))}
            </div>
          </div>

          {/* Library grouped by category */}
          {PATTERN_CATEGORIES.map((cat) => {
            const patterns = groupedPatterns[cat.id];
            if (!patterns || patterns.length === 0) return null;

            return (
              <div key={cat.id} className="mb-4">
                <div className="font-mono text-[0.55rem] text-text-dim tracking-[0.15em] uppercase mb-2">
                  {cat.label}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {patterns.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all duration-150 hover:border-gold/30"
                      style={{
                        background: "rgba(6,6,10,0.5)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      onClick={() => onApply?.(p.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-sans text-[0.75rem] text-text truncate">{p.name}</div>
                        <div className="font-mono text-[0.5rem] text-text-dim">
                          {p.bpmRange[0]}-{p.bpmRange[1]} BPM &middot; {p.timeSignature.numerator}/{p.timeSignature.denominator}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <DrumStepGrid pattern={p} compact />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
