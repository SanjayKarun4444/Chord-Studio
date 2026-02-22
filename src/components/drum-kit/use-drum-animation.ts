"use client";

import { useEffect, useRef } from "react";
import type { DrumType } from "@/lib/audio/drums/types";
import { onDrumHit } from "@/lib/drum-events";
import { getAudioCtx } from "@/lib/audio-engine";

export function useDrumAnimation(
  type: DrumType,
  animClass: string,
  animDuration: number,
) {
  const ref = useRef<SVGGElement>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const unsub = onDrumHit(type, (event) => {
      const el = ref.current;
      if (!el) return;

      let now = 0;
      try { now = getAudioCtx().currentTime; } catch { /* audio not init */ }
      const delay = Math.max(0, (event.scheduledTime - now) * 1000);

      const tid = window.setTimeout(() => {
        // Force reflow to restart animation on rapid re-triggers
        el.classList.remove(animClass);
        void el.getBBox();
        el.classList.add(animClass);

        const removeTid = window.setTimeout(() => {
          el.classList.remove(animClass);
        }, animDuration);
        timeoutsRef.current.push(removeTid);
      }, delay);

      timeoutsRef.current.push(tid);
    });

    return () => {
      unsub();
      timeoutsRef.current.forEach((tid) => clearTimeout(tid));
      timeoutsRef.current = [];
    };
  }, [type, animClass, animDuration]);

  return ref;
}
