"use client";

import { useState } from "react";

interface ChordCardProps {
  chord: string;
  index: number;
  isPlaying: boolean;
  isActive: boolean;
  onEdit: (index: number, newChord: string) => void;
}

export default function ChordCard({ chord, index, isActive, onEdit }: ChordCardProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(chord);

  const handleBlur = () => {
    setEditing(false);
    if (val.trim()) onEdit(index, val.trim());
    else setVal(chord);
  };

  return (
    <div
      className="chord-card-appear relative overflow-hidden border rounded-[14px] px-5 py-4 min-w-[90px] text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.04]"
      style={{
        background: isActive ? "rgba(255,209,102,0.14)" : "rgba(10,10,14,0.7)",
        borderColor: isActive ? "var(--color-gold)" : "var(--color-border)",
        cursor: editing ? "text" : "pointer",
        animationDelay: `${index * 0.1}s`,
        boxShadow: isActive
          ? "0 0 32px rgba(255,209,102,0.4), 0 0 60px rgba(255,209,102,0.15)"
          : "none",
        transform: isActive ? "scale(1.08) translateY(-3px)" : undefined,
      }}
      onClick={() => !editing && setEditing(true)}
    >
      {/* Active glow bg */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-[14px] pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 60%, rgba(255,209,102,0.22) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="font-mono text-[0.55rem] tracking-[0.14em] text-text-dim mb-1.5 uppercase">
        Bar {index + 1}
      </div>

      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          className="w-full bg-transparent border-none outline-none text-center font-display text-[1.3rem] font-normal text-gold"
        />
      ) : (
        <div
          className="font-display text-[1.3rem] font-normal transition-colors duration-200"
          style={{ color: isActive ? "var(--color-gold)" : "var(--color-text)" }}
        >
          {chord}
        </div>
      )}
    </div>
  );
}
