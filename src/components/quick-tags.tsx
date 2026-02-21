"use client";

import { QUICK_TAGS } from "@/lib/constants";

interface QuickTagsProps {
  onSelect: (prompt: string) => void;
  onDefault: () => void;
}

export default function QuickTags({ onSelect, onDefault }: QuickTagsProps) {
  return (
    <div className="flex flex-wrap gap-[7px] items-center">
      {/* Quick Start special pill */}
      <button
        onClick={onDefault}
        className="px-4 py-[7px] rounded-full font-mono text-[0.7rem] font-normal tracking-[0.08em] cursor-pointer transition-all duration-200 ease-out text-teal border border-[rgba(6,214,160,0.45)] bg-[rgba(6,214,160,0.08)] hover:bg-teal hover:text-black hover:shadow-[0_4px_16px_rgba(6,214,160,0.3)]"
      >
        &#9654; Quick Start
      </button>

      {QUICK_TAGS.map((tag) => (
        <button
          key={tag.label}
          onClick={() => onSelect(tag.prompt)}
          className="px-[15px] py-[7px] rounded-full font-sans text-[0.78rem] font-medium cursor-pointer transition-all duration-200 ease-out text-text-mid border border-[rgba(255,209,102,0.22)] bg-[rgba(255,209,102,0.04)] relative overflow-hidden hover:border-gold hover:text-black hover:bg-gold hover:shadow-[0_4px_18px_rgba(255,209,102,0.3)]"
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}
