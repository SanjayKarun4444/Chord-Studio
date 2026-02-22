"use client";

import { useState, useRef, useEffect } from "react";

interface HeroHeaderProps {
  uiMode: "landing" | "app";
  onSend: (msg: string) => void;
  onDefault: () => void;
  connected: boolean;
  reducedMotion: boolean;
}

const EXAMPLE_PROMPTS = [
  "dark trap beat in C minor at 140 BPM",
  "lo-fi jazz in F major at 85 BPM with warm Rhodes",
  "gospel progression in Bb at 72 BPM, big choir organ",
  "UK drill in D minor at 142 BPM, sliding 808",
];

export default function HeroHeader({
  uiMode,
  onSend,
  onDefault,
  connected,
  reducedMotion,
}: HeroHeaderProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isLanding = uiMode === "landing";
  const dur = reducedMotion ? "0ms" : "700ms";
  const fadeDur = reducedMotion ? "0ms" : "600ms";

  // Auto-focus input when landing
  useEffect(() => {
    if (isLanding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLanding]);

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    onSend(t);
    setInput("");
  };

  return (
    <section
      style={{
        minHeight: isLanding ? "100vh" : "0",
        transition: `min-height ${dur} cubic-bezier(0.22, 1, 0.36, 1)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Landing content ── */}
      <div
        style={{
          opacity: isLanding ? 1 : 0,
          transform: isLanding
            ? "scale(1) translateY(0)"
            : "scale(0.95) translateY(-30px)",
          transition: `opacity ${dur} cubic-bezier(0.22, 1, 0.36, 1), transform ${dur} cubic-bezier(0.22, 1, 0.36, 1)`,
          pointerEvents: isLanding ? "auto" : "none",
          position: isLanding ? "relative" : "absolute",
          inset: isLanding ? undefined : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: isLanding ? "100vh" : undefined,
          padding: "40px 20px",
        }}
      >
        <div
          className={isLanding ? "hero-stagger" : ""}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 640,
            width: "100%",
          }}
        >
          {/* Radial glow behind title */}
          <div
            className="hero-content-appear"
            style={{
              position: "absolute",
              width: "clamp(300px, 60vw, 540px)",
              height: "clamp(200px, 35vw, 340px)",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(255,209,102,0.08) 0%, rgba(255,209,102,0.02) 50%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -60%)",
              pointerEvents: "none",
            }}
          />

          {/* Title */}
          <h1
            className="hero-content-appear"
            style={{
              fontFamily: "var(--font-display), serif",
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              color: "var(--color-gold)",
              letterSpacing: "0.04em",
              textShadow:
                "0 0 40px rgba(255,209,102,0.3), 0 0 80px rgba(255,209,102,0.1)",
              margin: "0 0 8px 0",
              textAlign: "center",
              position: "relative",
            }}
          >
            Chord Studio
          </h1>

          {/* Badge */}
          <div
            className="hero-content-appear"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.68rem",
              color: "var(--color-teal)",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              opacity: 0.8,
              marginBottom: 24,
            }}
          >
            AI-Powered Music Generator
          </div>

          {/* Value prop */}
          <p
            className="hero-content-appear"
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "clamp(0.88rem, 1.8vw, 1rem)",
              color: "var(--color-text)",
              lineHeight: 1.7,
              textAlign: "center",
              maxWidth: 520,
              margin: "0 0 32px 0",
              opacity: 0.85,
            }}
          >
            Describe a vibe. We&rsquo;ll generate chords, drums, and melody
            instantly &mdash; playable in your browser.
          </p>

          {/* Example prompt pills */}
          <div
            className="hero-content-appear"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onSend(prompt)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 9999,
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color: "var(--color-text-mid)",
                  background: "rgba(255,209,102,0.04)",
                  border: "1px solid rgba(255,209,102,0.22)",
                  cursor: "pointer",
                  transition: "all 200ms ease-out",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "var(--color-gold)";
                  el.style.color = "#000";
                  el.style.background = "var(--color-gold)";
                  el.style.boxShadow = "0 4px 18px rgba(255,209,102,0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(255,209,102,0.22)";
                  el.style.color = "var(--color-text-mid)";
                  el.style.background = "rgba(255,209,102,0.04)";
                  el.style.boxShadow = "none";
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Tips */}
          <div
            className="hero-content-appear"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.62rem",
              color: "var(--color-text-dim)",
              letterSpacing: "0.08em",
              textAlign: "center",
              lineHeight: 1.8,
              marginBottom: 24,
              maxWidth: 460,
            }}
          >
            TIP: Include key, BPM, genre, and mood for the best results.
            <br />
            Try &ldquo;chill lo-fi in D minor at 78 BPM&rdquo; or &ldquo;epic
            orchestral in G minor&rdquo;.
          </div>

          {/* Input + Generate button */}
          <div
            className="hero-content-appear"
            style={{
              display: "flex",
              gap: 8,
              width: "100%",
              maxWidth: 560,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Describe your sound \u2014 genre, mood, key, BPM\u2026"
              className="hero-input-pulse"
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: 12,
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.9rem",
                color: "var(--color-text)",
                background: "rgba(8,8,10,0.85)",
                border: "1px solid var(--color-border)",
                outline: "none",
                transition: "border-color 250ms, box-shadow 250ms",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-gold)";
                e.currentTarget.style.boxShadow =
                  "0 0 22px rgba(255,209,102,0.12), inset 0 0 18px rgba(255,209,102,0.02)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: "14px 26px",
                borderRadius: 12,
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: 700,
                fontSize: "0.88rem",
                background: "var(--color-gold)",
                color: "#000",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 250ms ease-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(255,209,102,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Generate &#8629;
            </button>
          </div>

          {/* Enter hint */}
          <div
            className="hero-content-appear"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.58rem",
              color: "var(--color-text-dim)",
              letterSpacing: "0.12em",
              marginTop: 10,
              opacity: 0.6,
            }}
          >
            Press Enter to generate
          </div>

          {/* Quick start link */}
          <button
            className="hero-content-appear"
            onClick={onDefault}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.68rem",
              color: "var(--color-teal)",
              letterSpacing: "0.1em",
              marginTop: 16,
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.8,
              transition: "opacity 200ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
          >
            or try a Quick Start
          </button>
        </div>
      </div>

      {/* ── Compact app header ── */}
      <header
        style={{
          opacity: isLanding ? 0 : 1,
          transform: isLanding ? "translateY(-10px)" : "translateY(0)",
          transition: `opacity ${fadeDur} cubic-bezier(0.22, 1, 0.36, 1) ${reducedMotion ? "0ms" : "200ms"}, transform ${fadeDur} cubic-bezier(0.22, 1, 0.36, 1) ${reducedMotion ? "0ms" : "200ms"}`,
          pointerEvents: isLanding ? "none" : "auto",
          position: isLanding ? "absolute" : "relative",
          top: 0,
          left: 0,
          right: 0,
        }}
        className="flex items-center justify-between px-8 pt-5 pb-4 border-b border-border"
      >
        {/* Shimmer line */}
        <div className="shimmer-line absolute bottom-0 left-0 right-0 h-px" />

        <div className="flex items-baseline gap-3">
          <span
            className="font-display font-light text-gold tracking-wide"
            style={{ fontSize: "clamp(1.3rem,2.5vw,1.85rem)" }}
          >
            Chord Studio
          </span>
          <span className="font-mono text-[0.62rem] text-teal tracking-[0.25em] uppercase opacity-70">
            AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="dot-pulse w-1.5 h-1.5 rounded-full"
            style={{
              background: connected ? "#4CAF7D" : undefined,
              boxShadow: connected
                ? "0 0 8px rgba(76,175,125,0.7)"
                : "none",
            }}
          >
            {!connected && (
              <div className="w-full h-full rounded-full bg-text-dim" />
            )}
          </div>
          <span
            className="font-mono text-[0.6rem] tracking-[0.15em] uppercase"
            style={{ color: connected ? "#4CAF7D" : undefined }}
          >
            {connected ? "Connected" : "Offline mode"}
          </span>
        </div>
      </header>
    </section>
  );
}
