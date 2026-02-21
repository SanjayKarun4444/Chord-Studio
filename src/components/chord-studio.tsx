"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Progression, ChatMessage, MelodyNote } from "@/lib/types";
import { DEFAULT_PROGRESSIONS } from "@/lib/constants";
import { ensureAudioGraph, getMasterGain, setMasterVol as setMasterVolAudio } from "@/lib/audio-engine";
import { playVoice } from "@/lib/voices";
import { playDrum } from "@/lib/drums";
import { chordToMidi, normalizeToDisplayRange } from "@/lib/chord-utils";
import { generateMelody, playMelodyNote } from "@/lib/melody-engine";
import BackgroundCanvas from "./background-canvas";
import LoadingScreen from "./loading-screen";
import Header from "./header";
import ChatPanel from "./chat-panel";
import QuickTags from "./quick-tags";
import MetaCards from "./meta-cards";
import PianoRipple from "./piano-ripple";
import TransportBar from "./transport-bar";
import ChordCard from "./chord-card";
import MidiExport from "./midi-export";

interface PlaybackRef {
  timeout: ReturnType<typeof setTimeout> | null;
  startTime: number | null;
  chordIdx: number;
  melodyNotes: MelodyNote[];
  defaultIdx: number;
  playing: boolean;
  progression: Progression | null;
  instrument: string;
  drumsOn: boolean;
  melodyOn: boolean;
}

export default function ChordStudio() {
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content:
        "Hello. Describe your sound \u2014 genre, mood, key, BPM \u2014 and I\u2019ll compose a progression with drums, bass, and melody.",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drumsOn, setDrumsOn] = useState(true);
  const [melodyOn, setMelodyOn] = useState(false);
  const [instrument, setInstrument] = useState("piano");
  const [tempo, setTempo] = useState(120);
  const [masterVol, setMasterVol] = useState(80);
  const [melodyStyle, setMelodyStyle] = useState("none");
  const [activeChordIdx, setActiveChordIdx] = useState(-1);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);

  const playbackRef = useRef<PlaybackRef>({
    timeout: null,
    startTime: null,
    chordIdx: 0,
    melodyNotes: [],
    defaultIdx: 0,
    playing: false,
    progression: null,
    instrument: "piano",
    drumsOn: true,
    melodyOn: false,
  });

  // Sync vol to audio engine
  useEffect(() => {
    if (getMasterGain()) setMasterVolAudio(masterVol / 100);
  }, [masterVol]);

  // ─── PLAYBACK ENGINE ───
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setActiveChordIdx(-1);
    setActiveNotes([]);
    const ref = playbackRef.current;
    if (ref.timeout) {
      clearTimeout(ref.timeout);
      ref.timeout = null;
    }
    ref.startTime = null;
  }, []);

  const scheduleChord = useCallback(() => {
    const ref = playbackRef.current;
    const prog = ref.progression;
    if (!prog || !ref.playing) return;
    const ctx = ensureAudioGraph();
    const bpm = prog.tempo || 120;
    const spb = 60 / bpm;
    const barDur = spb * 4;
    const totalBars = prog.chords.length;

    if (ref.startTime === null) {
      ref.startTime = ctx.currentTime;
      ref.chordIdx = 0;
    }
    if (ref.chordIdx >= totalBars) {
      ref.chordIdx = 0;
      ref.startTime = ctx.currentTime;
    }

    const barStart = ref.startTime + ref.chordIdx * barDur;
    const msUntilBar = Math.max(0, (barStart - ctx.currentTime) * 1000);
    const uiIdx = ref.chordIdx;

    setTimeout(() => {
      if (!ref.playing) return;
      const chord = prog.chords[uiIdx];
      const midiNotes = chordToMidi(chord);
      setActiveChordIdx(uiIdx);
      setActiveNotes(normalizeToDisplayRange(midiNotes));

      // Schedule audio
      midiNotes.forEach((midi) => {
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        playVoice(ref.instrument || "piano", freq, barStart, barDur);
      });

      // Drums
      if (ref.drumsOn && prog.drums) {
        const d = prog.drums;
        const pl = d.patternLengthBeats || 4;
        const swing = (prog.swing || 0) / 100;
        const swOff = (pos: number) =>
          [0.5, 1.5, 2.5, 3.5].some((b) => Math.abs(pos - b) < 0.02)
            ? swing * (spb / 3)
            : 0;
        const sched = (arr: number[], type: string) =>
          arr.forEach((pos) =>
            playDrum(type, barStart + (pos % pl) * spb + swOff(pos)),
          );
        sched(d.kicks || [], "kick");
        sched(d.snares || [], "snare");
        sched(d.hihats || [], "hihat");
        sched(d.claps || [], "clap");
      }

      // Melody
      if (ref.melodyOn && ref.melodyNotes.length) {
        ref.melodyNotes
          .filter((n) => n.bar === uiIdx)
          .forEach((n) => {
            playMelodyNote(
              n.midi,
              barStart + n.beatOffset * spb,
              n.durationBeats * spb,
            );
          });
      }
    }, msUntilBar);

    ref.chordIdx++;
    const nextStart = ref.startTime + ref.chordIdx * barDur;
    const msNext = Math.max(0, (nextStart - ctx.currentTime) * 1000);
    ref.timeout = setTimeout(scheduleChord, msNext);
  }, []);

  const startPlayback = useCallback(() => {
    if (!progression) return;
    const ref = playbackRef.current;
    ref.playing = true;
    ref.progression = progression;
    ref.instrument = instrument;
    ref.drumsOn = drumsOn;
    ref.melodyOn = melodyOn;
    ref.startTime = null;
    ref.chordIdx = 0;
    if (melodyStyle !== "none") {
      ref.melodyNotes = generateMelody(
        progression.chords,
        progression.key || "C",
        melodyStyle,
      );
    } else {
      ref.melodyNotes = [];
    }
    setIsPlaying(true);
    scheduleChord();
  }, [progression, instrument, drumsOn, melodyOn, melodyStyle, scheduleChord]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      playbackRef.current.playing = false;
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  // Sync ref values without restarting playback
  useEffect(() => {
    playbackRef.current.instrument = instrument;
  }, [instrument]);
  useEffect(() => {
    playbackRef.current.drumsOn = drumsOn;
  }, [drumsOn]);
  useEffect(() => {
    playbackRef.current.melodyOn = melodyOn;
  }, [melodyOn]);
  useEffect(() => {
    if (progression)
      playbackRef.current.progression = { ...progression, tempo };
  }, [tempo, progression]);

  // ─── AI BACKEND ───
  const conversationRef = useRef<{ role: string; content: string }[]>([]);

  const sendMessage = async (msg: string) => {
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setIsThinking(true);
    try {
      conversationRef.current.push({ role: "user", content: msg });
      const res = await fetch("/api/chords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: conversationRef.current,
          userMessage: msg,
        }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Backend error");
      const data = await res.json();
      conversationRef.current.push({
        role: "assistant",
        content: data.raw || data.message,
      });
      setMessages((m) => [...m, { role: "ai", content: data.message }]);
      if (data.progression) {
        setProgression(data.progression);
        setTempo(data.progression.tempo || 120);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: `<span style="color:var(--color-rose)">Connection error. Make sure your OPENAI_API_KEY is set.</span>`,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const loadDefault = () => {
    const ref = playbackRef.current;
    const prog = JSON.parse(
      JSON.stringify(
        DEFAULT_PROGRESSIONS[ref.defaultIdx % DEFAULT_PROGRESSIONS.length],
      ),
    );
    ref.defaultIdx = (ref.defaultIdx || 0) + 1;
    setProgression(prog);
    setTempo(prog.tempo);
    setMessages((m) => [
      ...m,
      {
        role: "ai",
        content: `Loaded: <strong style="color:var(--color-gold)">${prog.label}</strong> \u2014 ${prog.key}, ${prog.tempo} BPM, ${prog.chords.join(" \u2192 ")}`,
      },
    ]);
  };

  const updateTempo = (v: number) => {
    setTempo(v);
    if (progression) {
      const p = { ...progression, tempo: v };
      setProgression(p);
      playbackRef.current.progression = p;
    }
  };

  const editChord = (idx: number, newChord: string) => {
    if (!progression) return;
    const chords = [...progression.chords];
    chords[idx] = newChord;
    const p = { ...progression, chords };
    setProgression(p);
    playbackRef.current.progression = p;
  };

  const handleMelodyStyle = (style: string) => {
    setMelodyStyle(style);
    setMelodyOn(style !== "none");
    if (progression && style !== "none") {
      playbackRef.current.melodyNotes = generateMelody(
        progression.chords,
        progression.key || "C",
        style,
      );
      playbackRef.current.melodyOn = true;
    } else {
      playbackRef.current.melodyNotes = [];
      playbackRef.current.melodyOn = false;
    }
  };

  return (
    <>
      <BackgroundCanvas />

      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      <div
        className="fixed inset-0 overflow-y-auto z-10 transition-all duration-[1100ms] ease-out"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "scale(0.97)",
        }}
      >
        <div className="max-w-[920px] mx-auto px-5 pb-15">
          <Header connected={true} />

          <div className="pt-6 flex flex-col gap-[18px]">
            {/* Quick tags */}
            <QuickTags onSelect={sendMessage} onDefault={loadDefault} />

            {/* Chat */}
            <ChatPanel
              messages={messages}
              isThinking={isThinking}
              onSend={sendMessage}
            />

            {/* Progression panel */}
            {progression && (
              <div
                className="result-appear relative overflow-hidden rounded-[20px] p-6"
                style={{
                  background: "rgba(8,8,12,0.88)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {/* Top shimmer border */}
                <div className="shimmer-line absolute top-0 left-0 right-0 h-px" />

                <h2 className="font-display font-normal text-[1.35rem] text-gold mb-[18px] tracking-[0.04em]">
                  Your Progression
                </h2>

                {/* Meta cards */}
                <MetaCards
                  genre={progression.genre}
                  mood={progression.mood}
                  tempo={tempo}
                  keyName={progression.key}
                />

                {/* Piano Ripple */}
                <div
                  className="overflow-hidden rounded-[14px] px-4 pt-3.5 pb-2.5 mb-3.5"
                  style={{
                    background: "rgba(4,4,6,0.8)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="font-mono text-[0.58rem] text-text-dim tracking-[0.18em] uppercase mb-2.5 opacity-70">
                    Keyboard &middot; click to preview &middot; plays with progression
                  </div>
                  <PianoRipple
                    activeNotes={activeNotes}
                    onKeyClick={(midi) => {
                      const ctx = ensureAudioGraph();
                      const freq = 440 * Math.pow(2, (midi - 69) / 12);
                      playVoice(instrument, freq, ctx.currentTime, 1.0);
                      setActiveNotes([midi]);
                      setTimeout(() => setActiveNotes([]), 1200);
                    }}
                  />
                </div>

                {/* Transport */}
                <TransportBar
                  isPlaying={isPlaying}
                  tempo={tempo}
                  instrument={instrument}
                  drumsOn={drumsOn}
                  melodyOn={melodyOn}
                  masterVol={masterVol}
                  melodyStyle={melodyStyle}
                  onPlayToggle={togglePlayback}
                  onTempo={updateTempo}
                  onInstrument={setInstrument}
                  onDrums={setDrumsOn}
                  onMelody={setMelodyOn}
                  onMasterVol={(v) => {
                    setMasterVol(v);
                    setMasterVolAudio(v / 100);
                  }}
                  onMelodyStyle={handleMelodyStyle}
                />

                {/* Chord cards */}
                <div className="mt-4 mb-1">
                  <div className="font-mono text-[0.58rem] text-text-dim tracking-[0.18em] uppercase mb-2.5 opacity-70">
                    Progression &middot; click card to edit
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {progression.chords.map((chord, i) => (
                      <ChordCard
                        key={i}
                        chord={chord}
                        index={i}
                        isActive={activeChordIdx === i}
                        isPlaying={isPlaying}
                        onEdit={editChord}
                      />
                    ))}
                  </div>
                </div>

                {/* MIDI Export */}
                <MidiExport progression={{ ...progression, tempo }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
