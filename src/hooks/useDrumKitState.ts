"use client";

import { useState, useCallback } from "react";
import type { DrumType } from "@/lib/audio/drums/types";

export function useDrumKitState() {
  const [muted, setMuted] = useState<Set<DrumType>>(new Set());
  const [soloed, setSoloed] = useState<Set<DrumType>>(new Set());

  const toggleMute = useCallback((type: DrumType) => {
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const toggleSolo = useCallback((type: DrumType) => {
    setSoloed((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const isAudible = useCallback(
    (type: DrumType): boolean => {
      if (muted.has(type)) return false;
      if (soloed.size > 0 && !soloed.has(type)) return false;
      return true;
    },
    [muted, soloed],
  );

  return { muted, soloed, toggleMute, toggleSolo, isAudible };
}
