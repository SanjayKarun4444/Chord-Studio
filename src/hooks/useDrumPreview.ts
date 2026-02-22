"use client";

import { useRef, useCallback } from "react";
import { LookaheadScheduler } from "@/lib/scheduler";
import { ensureAudioGraph, getDrumGain } from "@/lib/audio-engine";
import { playDrum } from "@/lib/drums";
import type { StepGridPattern } from "@/lib/drums/pattern-library";
import { stepGridToDrumPattern } from "@/lib/drums/pattern-library";
import type { DrumPattern } from "@/lib/types";

/**
 * Hook for previewing a drum pattern independently of main playback.
 * Creates a dedicated scheduler that loops 1 bar.
 */
export function useDrumPreview() {
  const schedulerRef = useRef<LookaheadScheduler | null>(null);
  const previewingRef = useRef<string | null>(null);

  const stopPreview = useCallback(() => {
    if (schedulerRef.current) {
      schedulerRef.current.stop();
      schedulerRef.current = null;
    }
    previewingRef.current = null;
  }, []);

  const startPreview = useCallback((pattern: StepGridPattern, bpm: number = 120) => {
    stopPreview();

    const ctx = ensureAudioGraph();
    const drumPattern = stepGridToDrumPattern(pattern);
    previewingRef.current = pattern.id;

    const scheduler = new LookaheadScheduler(
      ctx,
      ({ barStartTime }) => {
        const spb = 60 / bpm;
        const schedArr = (arr: number[], vels: number[] | undefined, type: string) => {
          arr.forEach((pos, i) => {
            const vel = vels?.[i] ?? 1.0;
            playDrum(type, barStartTime + pos * spb, vel);
          });
        };

        schedArr(drumPattern.kicks, drumPattern.kickVels, "kick");
        schedArr(drumPattern.snares, drumPattern.snareVels, "snare");
        schedArr(drumPattern.hihats, drumPattern.hihatVels, "hihat");
        schedArr(drumPattern.claps, drumPattern.clapVels, "clap");
        schedArr(drumPattern.ohats, drumPattern.ohatVels, "ohat");
      },
    );

    schedulerRef.current = scheduler;
    scheduler.start(bpm, 1); // loop 1 bar
  }, [stopPreview]);

  const togglePreview = useCallback((pattern: StepGridPattern, bpm?: number) => {
    if (previewingRef.current === pattern.id) {
      stopPreview();
    } else {
      startPreview(pattern, bpm);
    }
  }, [startPreview, stopPreview]);

  return { startPreview, stopPreview, togglePreview, previewingRef };
}
