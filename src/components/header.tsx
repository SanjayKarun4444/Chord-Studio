"use client";

interface HeaderProps {
  connected: boolean;
}

export default function Header({ connected }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 pt-5 pb-4 border-b border-border relative">
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
            boxShadow: connected ? "0 0 8px rgba(76,175,125,0.7)" : "none",
          }}
        >
          {!connected && <div className="w-full h-full rounded-full bg-text-dim" />}
        </div>
        <span
          className="font-mono text-[0.6rem] tracking-[0.15em] uppercase"
          style={{ color: connected ? "#4CAF7D" : undefined }}
        >
          {connected ? "Connected" : "Offline mode"}
        </span>
      </div>
    </header>
  );
}
