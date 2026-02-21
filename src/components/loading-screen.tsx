"use client";

import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [statusIdx, setStatusIdx] = useState(0);
  const [exiting, setExiting] = useState(false);
  const labels = ["Initializing", "Loading engine", "Calibrating harmonics", "Ready"];

  useEffect(() => {
    const iv = setInterval(
      () => setStatusIdx((i) => (i + 1) % labels.length),
      1400,
    );
    const to = setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 900);
    }, 3600);
    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bars = Array.from({ length: 20 }, (_, i) => {
    const t = i / 19;
    return {
      h: `${Math.round(5 + Math.sin(t * Math.PI) * 18)}px`,
      d: `${Math.round((1.8 + Math.sin(t * Math.PI * 2) * 0.6) * 100) / 100}s`,
      delay: `${Math.round(t * 0.95 * 100) / 100}s`,
    };
  });

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-end transition-opacity duration-[900ms] ease-out"
      style={{
        background: "radial-gradient(ellipse at 50% 75%, #1a1100 0%, #0a0800 40%, #020204 100%)",
        paddingBottom: "13vh",
        opacity: exiting ? 0 : 1,
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      {/* Ambient orb */}
      <div
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,209,102,0.04) 0%, transparent 65%)",
          transform: "translate(-50%,-50%)",
          animation: "orb 7s ease-in-out infinite",
        }}
      />

      <div className="relative flex flex-col items-center gap-0 z-10">
        {/* Logo mark */}
        <div
          className="w-[52px] h-[52px] mb-8"
          style={{ animation: "fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}
        >
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="26" cy="26" r="20" stroke="rgba(255,209,102,0.3)" strokeWidth="0.8" />
            <circle cx="26" cy="26" r="12" stroke="rgba(255,209,102,0.6)" strokeWidth="0.8" />
            <line x1="26" y1="6" x2="26" y2="14" stroke="rgba(255,209,102,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="26" y1="38" x2="26" y2="46" stroke="rgba(255,209,102,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="26" x2="14" y2="26" stroke="rgba(255,209,102,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="38" y1="26" x2="46" y2="26" stroke="rgba(255,209,102,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="26" cy="26" r="3" fill="rgba(255,209,102,0.85)" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="font-display font-light tracking-[0.2em] uppercase mb-2"
          style={{
            fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
            color: "rgba(237,232,216,0.94)",
            animation: "fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.45s both",
          }}
        >
          Chord Studio
        </h1>

        <p
          className="font-mono font-light text-[0.68rem] tracking-[0.4em] uppercase mb-12"
          style={{
            color: "rgba(255,209,102,0.45)",
            animation: "fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.65s both",
          }}
        >
          AI Music Generator
        </p>

        {/* Wave bars */}
        <div
          className="flex items-center justify-center gap-[3px] w-[140px] h-8 mb-9"
          style={{ animation: "fadeIn 1.2s ease 0.9s both" }}
        >
          {bars.map((b, i) => (
            <span
              key={i}
              className="intro-wave-bar block w-0.5 rounded-sm"
              style={{
                background: "rgba(255,209,102,0.4)",
                "--h": b.h,
                "--d": b.d,
                "--delay": b.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Status */}
        <p
          className="font-mono font-light text-[0.62rem] tracking-[0.25em] uppercase"
          style={{
            color: "rgba(237,232,216,0.28)",
            animation: "fadeIn 1s ease 1.2s both",
          }}
        >
          {labels[statusIdx]}
        </p>
      </div>
    </div>
  );
}
