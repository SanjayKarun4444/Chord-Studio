"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ensureAudioGraph, getInstrumentBus, getBassBus, getDrumBus, getMelodyBus } from "@/lib/audio-engine";
import { playVoice } from "@/lib/voices";
import { playDrum } from "@/lib/drums";
import { playMelodyNote } from "@/lib/melody-engine";
import { LookaheadScheduler } from "@/lib/scheduler";
import { chordTones } from "@/lib/melody-engine";

const INSTRUMENTS = ["piano", "synth", "pad", "organ", "bells", "pluck", "bass", "epiano"];
const CHORDS = ["Cm", "Ab", "Bb", "G"];
const BPM = 140;
const BARS_PER_INSTRUMENT = 4;

interface BusLevels {
  instrument: number;
  bass: number;
  drum: number;
  melody: number;
}

export default function EarCheckPage() {
  const [playing, setPlaying] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState(INSTRUMENTS[0]);
  const [barCount, setBarCount] = useState(0);
  const [busLevels, setBusLevels] = useState<BusLevels>({ instrument: 0, bass: 0, drum: 0, melody: 0 });

  const schedulerRef = useRef<LookaheadScheduler | null>(null);
  const analysersRef = useRef<{
    instrument: AnalyserNode | null;
    bass: AnalyserNode | null;
    drum: AnalyserNode | null;
    melody: AnalyserNode | null;
  }>({ instrument: null, bass: null, drum: null, melody: null });
  const rafRef = useRef<number>(0);
  const instrumentIdxRef = useRef(0);
  const barInInstrumentRef = useRef(0);

  const setupAnalysers = useCallback(() => {
    const ctx = ensureAudioGraph();
    const buses = {
      instrument: getInstrumentBus(),
      bass: getBassBus(),
      drum: getDrumBus(),
      melody: getMelodyBus(),
    };

    for (const [key, bus] of Object.entries(buses)) {
      if (bus && !analysersRef.current[key as keyof typeof analysersRef.current]) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        bus.output.connect(analyser);
        analysersRef.current[key as keyof typeof analysersRef.current] = analyser;
      }
    }
  }, []);

  const getPeakLevel = (analyser: AnalyserNode | null): number => {
    if (!analyser) return 0;
    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
    return peak;
  };

  const updateLevels = useCallback(() => {
    const levels: BusLevels = {
      instrument: getPeakLevel(analysersRef.current.instrument),
      bass: getPeakLevel(analysersRef.current.bass),
      drum: getPeakLevel(analysersRef.current.drum),
      melody: getPeakLevel(analysersRef.current.melody),
    };
    setBusLevels(levels);

    if (levels.instrument > 0.01 || levels.bass > 0.01 || levels.drum > 0.01 || levels.melody > 0.01) {
      console.log(
        `[ear-check] peaks — inst: ${levels.instrument.toFixed(3)} bass: ${levels.bass.toFixed(3)} drum: ${levels.drum.toFixed(3)} melody: ${levels.melody.toFixed(3)}`,
      );
    }

    rafRef.current = requestAnimationFrame(updateLevels);
  }, []);

  const handlePlay = useCallback(() => {
    if (playing) {
      schedulerRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
      setPlaying(false);
      return;
    }

    const ctx = ensureAudioGraph();
    setupAnalysers();
    instrumentIdxRef.current = 0;
    barInInstrumentRef.current = 0;

    const spb = 60 / BPM;
    const barDur = spb * 4;

    const scheduler = new LookaheadScheduler(
      ctx,
      ({ barIndex, barStartTime }) => {
        const instIdx = instrumentIdxRef.current;
        const inst = INSTRUMENTS[instIdx];
        const chord = CHORDS[barIndex % CHORDS.length];
        const tones = chordTones(chord);

        // Play chord with current instrument
        tones.forEach((midi) => {
          const freq = 440 * Math.pow(2, (midi - 69) / 12);
          playVoice(inst, freq, barStartTime, barDur);
        });

        // Trap drums
        const kicks = [0, 0.75, 2];
        const snares = [1, 3];
        const hihats = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75];

        kicks.forEach((pos) => playDrum("kick", barStartTime + pos * spb));
        snares.forEach((pos) => playDrum("snare", barStartTime + pos * spb));
        hihats.forEach((pos, i) => playDrum("hihat", barStartTime + pos * spb, i % 2 === 0 ? 1.0 : 0.6));

        // Simple melody
        playMelodyNote(tones[0] + 12, barStartTime, barDur * 0.9);
      },
      (barIndex) => {
        barInInstrumentRef.current++;
        const totalBar = instrumentIdxRef.current * BARS_PER_INSTRUMENT + barInInstrumentRef.current;
        setBarCount(totalBar);

        if (barInInstrumentRef.current >= BARS_PER_INSTRUMENT) {
          barInInstrumentRef.current = 0;
          instrumentIdxRef.current++;
          if (instrumentIdxRef.current >= INSTRUMENTS.length) {
            instrumentIdxRef.current = 0;
          }
          setCurrentInstrument(INSTRUMENTS[instrumentIdxRef.current]);
        }
      },
    );

    schedulerRef.current = scheduler;
    setPlaying(true);
    setCurrentInstrument(INSTRUMENTS[0]);
    setBarCount(0);
    scheduler.start(BPM, CHORDS.length);
    rafRef.current = requestAnimationFrame(updateLevels);
  }, [playing, setupAnalysers, updateLevels]);

  useEffect(() => {
    return () => {
      schedulerRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const levelBar = (value: number, label: string) => (
    <div className="flex items-center gap-3 font-mono text-sm">
      <span className="w-24 text-right text-zinc-400">{label}</span>
      <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-75"
          style={{ width: `${Math.min(value * 100, 100)}%` }}
        />
      </div>
      <span className="w-16 text-zinc-500">{value.toFixed(3)}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-2">Ear Check — Audio Engine Test</h1>
      <p className="text-zinc-400 mb-6">
        Plays Cm → Ab → Bb → G at {BPM} BPM, cycling through all 8 instruments ({BARS_PER_INSTRUMENT} bars each).
      </p>

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handlePlay}
          className="px-6 py-2 rounded-lg font-semibold text-lg bg-emerald-600 hover:bg-emerald-500 transition-colors"
        >
          {playing ? "Stop" : "Play"}
        </button>
        <div className="text-lg">
          <span className="text-zinc-400">Instrument: </span>
          <span className="text-emerald-400 font-semibold">{currentInstrument}</span>
        </div>
        <div className="text-zinc-500">Bar {barCount}</div>
      </div>

      <div className="max-w-xl space-y-2">
        <h2 className="text-sm font-semibold text-zinc-300 mb-2 uppercase tracking-wider">Bus Peak Levels</h2>
        {levelBar(busLevels.instrument, "Instrument")}
        {levelBar(busLevels.bass, "Bass")}
        {levelBar(busLevels.drum, "Drum")}
        {levelBar(busLevels.melody, "Melody")}
      </div>

      <div className="mt-8 text-xs text-zinc-600">
        Open DevTools console for per-frame peak logs.
      </div>
    </div>
  );
}
