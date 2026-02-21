"use client";

interface MetaCardsProps {
  genre: string;
  mood: string;
  tempo: number;
  keyName: string;
}

export default function MetaCards({ genre, mood, tempo, keyName }: MetaCardsProps) {
  const items = [
    { label: "Genre", value: genre || "\u2014" },
    { label: "Mood", value: mood ? mood[0].toUpperCase() + mood.slice(1) : "\u2014" },
    { label: "Tempo", value: `${tempo} BPM` },
    { label: "Key", value: keyName || "\u2014" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="bg-black/45 border border-border rounded-[10px] p-3 text-center transition-all duration-250 ease-out hover:border-border-hi hover:bg-[rgba(255,209,102,0.05)] hover:-translate-y-0.5"
        >
          <div className="font-mono text-[0.55rem] tracking-[0.14em] uppercase text-text-dim mb-1.5">
            {label}
          </div>
          <div className="font-display text-[1.1rem] text-text">{value}</div>
        </div>
      ))}
    </div>
  );
}
