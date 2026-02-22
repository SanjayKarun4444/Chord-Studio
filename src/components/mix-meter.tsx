"use client";

import { useEffect, useRef } from "react";
import {
  getInstrumentBus,
  getBassBus,
  getDrumBus,
  getMelodyBus,
  getAudioCtx,
} from "@/lib/audio-engine";

interface MixMeterProps {
  isPlaying: boolean;
}

const CHANNELS = [
  { label: "INST", color: "#FFD166", getBus: getInstrumentBus },
  { label: "BASS", color: "#06D6A0", getBus: getBassBus },
  { label: "DRUM", color: "#EF476F", getBus: getDrumBus },
  { label: "MEL",  color: "#A855F7", getBus: getMelodyBus },
] as const;

export default function MixMeter({ isPlaying }: MixMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysersRef = useRef<AnalyserNode[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // Create analysers if not yet created
    if (analysersRef.current.length === 0) {
      const audioCtx = getAudioCtx();
      analysersRef.current = CHANNELS.map(({ getBus }) => {
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        const bus = getBus();
        if (bus) bus.output.connect(analyser);
        return analyser;
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barWidth = 12;
    const gap = 6;
    const totalWidth = CHANNELS.length * barWidth + (CHANNELS.length - 1) * gap;
    canvas.width = totalWidth + 8;
    canvas.height = 40;

    const dataArrays = analysersRef.current.map((a) => new Uint8Array(a.frequencyBinCount));

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      analysersRef.current.forEach((analyser, i) => {
        analyser.getByteFrequencyData(dataArrays[i]);
        // RMS level
        let sum = 0;
        for (let j = 0; j < dataArrays[i].length; j++) {
          sum += dataArrays[i][j] * dataArrays[i][j];
        }
        const rms = Math.sqrt(sum / dataArrays[i].length) / 255;
        const level = Math.min(1, rms * 2.5); // boost for visibility

        const x = 4 + i * (barWidth + gap);
        const barH = level * (canvas.height - 10);

        // Bar
        ctx.fillStyle = CHANNELS[i].color + "55";
        ctx.fillRect(x, canvas.height - 4 - barH, barWidth, barH);

        // Peak cap
        ctx.fillStyle = CHANNELS[i].color;
        ctx.fillRect(x, canvas.height - 4 - barH - 2, barWidth, 2);

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.font = "7px monospace";
        ctx.textAlign = "center";
        ctx.fillText(CHANNELS[i].label, x + barWidth / 2, canvas.height - 1);
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded"
      style={{ width: 84, height: 40, opacity: isPlaying ? 1 : 0.3 }}
    />
  );
}
