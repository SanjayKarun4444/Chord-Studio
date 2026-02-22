"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ensureAudioGraph, getDrumGain, getDrumBus } from "@/lib/audio-engine";
import { playDrum, initSamplePlayer, getSamplePlayer, setDrumEngineMode } from "@/lib/drums";
import { LookaheadScheduler } from "@/lib/scheduler";
import { PACK_REGISTRY } from "@/lib/audio/drums/pack-manifests";
import type { DrumType, PackId, DrumEngineMode } from "@/lib/audio/drums/types";

const DRUM_TYPES: DrumType[] = ["kick", "snare", "hihat", "ohat", "clap"];
const PACK_IDS = Object.keys(PACK_REGISTRY) as PackId[];
const DEFAULT_BPM = 120;

export default function DrumTestPage() {
  const [packId, setPackId] = useState<PackId>("trap");
  const [engineMode, setEngineMode] = useState<DrumEngineMode>("samples");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [velocity, setVelocity] = useState(0.8);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [playing, setPlaying] = useState(false);
  const [rrIndicators, setRrIndicators] = useState<Record<DrumType, number>>({
    kick: 0, snare: 0, hihat: 0, ohat: 0, clap: 0,
    crash: 0, ride: 0, high_tom: 0, mid_tom: 0, floor_tom: 0,
  });
  const [drumLevel, setDrumLevel] = useState(0);

  const schedulerRef = useRef<LookaheadScheduler | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);

  const handleLoadPack = useCallback(async (id: PackId) => {
    setPackId(id);
    setLoading(true);
    setLoaded(false);

    const ctx = ensureAudioGraph();
    const drumGain = getDrumGain();
    if (!drumGain) return;

    let player = getSamplePlayer();
    if (!player) {
      player = initSamplePlayer(ctx, drumGain);
    }

    try {
      await player.loadPack(id);
      setLoaded(true);
    } catch (e) {
      console.error("Failed to load pack:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEngineMode = useCallback((mode: DrumEngineMode) => {
    setEngineMode(mode);
    setDrumEngineMode(mode);
  }, []);

  const handlePlayHit = useCallback((type: DrumType) => {
    const ctx = ensureAudioGraph();
    playDrum(type, ctx.currentTime, velocity);
    setRrIndicators((prev) => ({
      ...prev,
      [type]: (prev[type] + 1) % (PACK_REGISTRY[packId]?.drums[type]?.length || 1),
    }));
  }, [velocity, packId]);

  // Level meter
  const setupAnalyser = useCallback(() => {
    if (analyserRef.current) return;
    const ctx = ensureAudioGraph();
    const bus = getDrumBus();
    if (!bus) return;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    bus.output.connect(analyser);
    analyserRef.current = analyser;
  }, []);

  const updateLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (analyser) {
      const data = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > peak) peak = abs;
      }
      setDrumLevel(peak);
    }
    rafRef.current = requestAnimationFrame(updateLevel);
  }, []);

  const handlePattern = useCallback(() => {
    if (playing) {
      schedulerRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
      setPlaying(false);
      return;
    }

    const ctx = ensureAudioGraph();
    setupAnalyser();

    const spb = 60 / bpm;
    const scheduler = new LookaheadScheduler(
      ctx,
      ({ barStartTime }) => {
        // Simple pattern: kick on 1,3 — snare on 2,4 — hihat 8ths — ohat on 4.5 — clap on 2
        const kicks = [0, 2];
        const snares = [1, 3];
        const hihats = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
        const claps = [1];
        const ohats = [3.5];

        kicks.forEach((pos) => playDrum("kick", barStartTime + pos * spb, velocity));
        snares.forEach((pos) => playDrum("snare", barStartTime + pos * spb, velocity * 0.9));
        hihats.forEach((pos, i) => playDrum("hihat", barStartTime + pos * spb, i % 2 === 0 ? velocity : velocity * 0.6));
        claps.forEach((pos) => playDrum("clap", barStartTime + pos * spb, velocity * 0.85));
        ohats.forEach((pos) => playDrum("ohat", barStartTime + pos * spb, velocity * 0.7));
      },
      () => {},
    );

    schedulerRef.current = scheduler;
    setPlaying(true);
    scheduler.start(bpm, 1); // 1-bar loop
    rafRef.current = requestAnimationFrame(updateLevel);
  }, [playing, bpm, velocity, setupAnalyser, updateLevel]);

  useEffect(() => {
    return () => {
      schedulerRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Auto-load initial pack
  useEffect(() => {
    handleLoadPack(packId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Drum Sample Test Harness</h1>
      <p className="text-zinc-400 mb-6">
        Audition drum samples, verify round-robin, A/B synth vs samples.
      </p>

      {/* Pack selector */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-zinc-400">Pack:</span>
        <select
          value={packId}
          onChange={(e) => handleLoadPack(e.target.value as PackId)}
          className="bg-zinc-800 text-white px-3 py-1.5 rounded text-sm"
        >
          {PACK_IDS.map((id) => (
            <option key={id} value={id}>{PACK_REGISTRY[id].label}</option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">
          {loading ? "Loading..." : loaded ? "Loaded" : "Not loaded"}
        </span>
      </div>

      {/* Engine toggle */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-zinc-400">Engine:</span>
        <div className="flex rounded overflow-hidden border border-zinc-700">
          {(["synth", "samples"] as DrumEngineMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleEngineMode(mode)}
              className={`px-4 py-1.5 text-sm font-mono uppercase ${
                engineMode === mode ? "bg-amber-600 text-black" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Velocity */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-zinc-400">Velocity:</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(velocity * 100)}
          onChange={(e) => setVelocity(parseInt(e.target.value) / 100)}
          className="w-48"
        />
        <span className="text-sm text-zinc-500 w-10">{Math.round(velocity * 100)}%</span>
      </div>

      {/* Individual drum hits */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Individual Hits</h2>
        <div className="flex flex-wrap gap-2">
          {DRUM_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handlePlayHit(type)}
              className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition-colors"
            >
              {type.toUpperCase()}
              <span className="ml-2 text-xs text-zinc-500">RR:{rrIndicators[type]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pattern playback */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Pattern Playback</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePattern}
            className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
              playing ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {playing ? "Stop" : "Play Pattern"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">BPM:</span>
            <input
              type="number"
              min={40}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value) || DEFAULT_BPM)}
              className="bg-zinc-800 text-white px-2 py-1 rounded text-sm w-16"
            />
          </div>
        </div>
      </div>

      {/* Level meter */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-2 uppercase tracking-wider">Drum Bus Level</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-75"
              style={{ width: `${Math.min(drumLevel * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm text-zinc-500 w-16">{drumLevel.toFixed(3)}</span>
        </div>
      </div>

      <div className="text-xs text-zinc-600">
        Open DevTools console for load/playback logs.
      </div>
    </div>
  );
}
