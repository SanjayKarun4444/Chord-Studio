"use client";

import type { ReactNode, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import type { DrumType } from "@/lib/audio/drums/types";
import { useDrumAnimation } from "./use-drum-animation";

interface DrumPieceProps {
  type: DrumType;
  x: number;
  y: number;
  label: string;
  animClass: string;
  animDuration: number;
  isMuted: boolean;
  onTrigger: (type: DrumType, velocity: number) => void;
  children: ReactNode;
}

export default function DrumPiece({
  type,
  x,
  y,
  label,
  animClass,
  animDuration,
  isMuted,
  onTrigger,
  children,
}: DrumPieceProps) {
  const ref = useDrumAnimation(type, animClass, animDuration);

  const handleClick = (e: ReactMouseEvent) => {
    const velocity = e.shiftKey ? 1.0 : e.altKey ? 0.4 : 0.8;
    onTrigger(type, velocity);
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTrigger(type, 0.8);
    }
  };

  return (
    <g
      ref={ref}
      transform={`translate(${x}, ${y})`}
      className="drum-piece-hover"
      style={{
        opacity: isMuted ? 0.3 : 1,
        transformOrigin: "0px 0px",
        transition: "opacity 0.2s ease",
      }}
      role="button"
      tabIndex={0}
      aria-label={`${label} drum`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </g>
  );
}
