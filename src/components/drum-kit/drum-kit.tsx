"use client";

import type { DrumType } from "@/lib/audio/drums/types";
import type { DrumPieceConfig } from "./drum-kit-types";
import DrumPiece from "./drum-piece";
import KickSVG from "./pieces/kick";
import SnareSVG from "./pieces/snare";
import HihatSVG from "./pieces/hihat";
import OpenHihatSVG from "./pieces/open-hihat";
import CrashSVG from "./pieces/crash";
import RideSVG from "./pieces/ride";
import HighTomSVG from "./pieces/high-tom";
import MidTomSVG from "./pieces/mid-tom";
import FloorTomSVG from "./pieces/floor-tom";
import ClapSVG from "./pieces/clap";

const PIECE_SVG: Record<DrumType, React.FC> = {
  kick: KickSVG,
  snare: SnareSVG,
  hihat: HihatSVG,
  ohat: OpenHihatSVG,
  crash: CrashSVG,
  ride: RideSVG,
  high_tom: HighTomSVG,
  mid_tom: MidTomSVG,
  floor_tom: FloorTomSVG,
  clap: ClapSVG,
};

/** SVG gradient defs — duplicated per mini-SVG because gradient refs don't cross SVG boundaries */
function GradientDefs() {
  return (
    <defs>
      <radialGradient id="drumHeadGrad" cx="40%" cy="35%">
        <stop offset="0%" stopColor="#1a1816" />
        <stop offset="100%" stopColor="#0e0d0b" />
      </radialGradient>
      <linearGradient id="cymbalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2a2520" />
        <stop offset="50%" stopColor="#1e1a16" />
        <stop offset="100%" stopColor="#252018" />
      </linearGradient>
      <linearGradient id="cymbalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#302818" />
        <stop offset="50%" stopColor="#28220f" />
        <stop offset="100%" stopColor="#352a14" />
      </linearGradient>
    </defs>
  );
}

interface DrumColumnProps {
  pieces: DrumPieceConfig[];
  onTrigger: (type: DrumType, velocity: number) => void;
  isAudible: (type: DrumType) => boolean;
}

export default function DrumColumn({ pieces, onTrigger, isAudible }: DrumColumnProps) {
  return (
    <div className="flex flex-col items-center gap-0.5" role="group" aria-label="Drum column">
      {pieces.map((cfg) => {
        const PieceSVG = PIECE_SVG[cfg.type];
        return (
          <svg
            key={cfg.type}
            viewBox="-56 -42 112 100"
            width={52}
            overflow="visible"
          >
            <GradientDefs />
            <DrumPiece
              type={cfg.type}
              x={0}
              y={0}
              label={cfg.label}
              animClass={cfg.animClass}
              animDuration={cfg.animDuration}
              isMuted={!isAudible(cfg.type)}
              onTrigger={onTrigger}
            >
              <PieceSVG />
            </DrumPiece>
          </svg>
        );
      })}
    </div>
  );
}
