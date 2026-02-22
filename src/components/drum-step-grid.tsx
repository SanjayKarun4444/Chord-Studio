"use client";

import type { StepGridPattern, PatternTrackId } from "@/lib/drums/pattern-library";

interface DrumStepGridProps {
  pattern: StepGridPattern;
  activeStep?: number;        // current playback step for cursor
  compact?: boolean;          // smaller version for previews
}

const CORE_TRACKS: { id: PatternTrackId; label: string; color: string }[] = [
  { id: "kick",  label: "KCK", color: "var(--color-gold)" },
  { id: "snare", label: "SNR", color: "var(--color-rose)" },
  { id: "hihat", label: "HHT", color: "var(--color-teal)" },
  { id: "clap",  label: "CLP", color: "#A855F7" },
  { id: "ohat",  label: "OHT", color: "#22D3EE" },
];

const EXTENDED_TRACKS: { id: PatternTrackId; label: string; color: string }[] = [
  { id: "crash",     label: "CRS", color: "#FACC15" },
  { id: "ride",      label: "RDE", color: "#94A3B8" },
  { id: "high_tom",  label: "HTM", color: "#FB923C" },
  { id: "mid_tom",   label: "MTM", color: "#F97316" },
  { id: "floor_tom", label: "FTM", color: "#EA580C" },
];

export default function DrumStepGrid({ pattern, activeStep = -1, compact = false }: DrumStepGridProps) {
  const { totalSteps, stepsPerBeat, tracks } = pattern;
  const cellSize = compact ? 10 : 16;
  const gap = compact ? 1 : 2;
  const labelW = compact ? 0 : 32;

  // Build visible track list: always show core, show extended only if present
  const visibleTracks = [
    ...CORE_TRACKS,
    ...EXTENDED_TRACKS.filter(({ id }) => id in tracks),
  ];

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        background: "rgba(4,4,6,0.8)",
        border: "1px solid var(--color-border)",
        padding: compact ? 4 : 8,
      }}
    >
      <div className="flex flex-col" style={{ gap }}>
        {visibleTracks.map(({ id, label, color }) => {
          const track = tracks[id as keyof typeof tracks];
          if (!track) return null;
          return (
            <div key={id} className="flex items-center" style={{ gap }}>
              {/* Track label */}
              {!compact && (
                <span
                  className="font-mono text-[0.5rem] tracking-[0.08em] uppercase shrink-0 text-right"
                  style={{ width: labelW, color: "var(--color-text-dim)" }}
                >
                  {label}
                </span>
              )}

              {/* Step cells */}
              {Array.from({ length: totalSteps }, (_, step) => {
                const data = track.steps[step];
                const isActive = data && data.velocity > 0;
                const isBeatBoundary = step % stepsPerBeat === 0;
                const isCursor = step === activeStep;

                return (
                  <div
                    key={step}
                    className="relative rounded-[2px] transition-opacity duration-75"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      background: isActive
                        ? color
                        : isBeatBoundary
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(255,255,255,0.03)",
                      opacity: isActive ? data.velocity : 1,
                      borderLeft: isBeatBoundary && step > 0
                        ? "1px solid rgba(255,209,102,0.15)"
                        : "none",
                      boxShadow: isCursor
                        ? `0 0 6px rgba(255,209,102,0.6), inset 0 0 4px rgba(255,209,102,0.3)`
                        : isActive
                          ? `0 0 ${compact ? 2 : 4}px ${color}44`
                          : "none",
                    }}
                  >
                    {isCursor && (
                      <div
                        className="absolute inset-0 rounded-[2px] step-cursor"
                        style={{
                          background: "rgba(255,209,102,0.25)",
                          border: "1px solid rgba(255,209,102,0.5)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
