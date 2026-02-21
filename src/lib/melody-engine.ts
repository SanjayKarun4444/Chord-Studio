import { NOTE_MIDI_MAP } from "./constants";
import { ensureAudioGraph, getMelodyGain } from "./audio-engine";
import type { MelodyNote } from "./types";

export function keyScale(keyStr: string): number[] {
  const m = keyStr.match(/^([A-G][#b]?)\s*(m(?:in)?|minor)?/i);
  const rootPc = (NOTE_MIDI_MAP[m ? m[1] : "C"] || 60) % 12;
  const isMinor = m && m[2];
  return (isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11]).map(
    (s) => (rootPc + s) % 12,
  );
}

export function chordTones(chordName: string): number[] {
  const m = chordName.match(/^([A-G][#b]?)/);
  if (!m) return [60, 64, 67];
  const root = NOTE_MIDI_MAP[m[1]] ?? 60;
  let iv: number[];
  if (chordName.match(/maj7/)) iv = [0, 4, 7, 11];
  else if (chordName.match(/m7/)) iv = [0, 3, 7, 10];
  else if (chordName.match(/7/)) iv = [0, 4, 7, 10];
  else if (chordName.match(/m/)) iv = [0, 3, 7];
  else iv = [0, 4, 7];
  return iv.map((i) => {
    let midi = root + i;
    while (midi < 60) midi += 12;
    while (midi > 84) midi -= 12;
    return midi;
  });
}

export function voiceLead(prev: number, tones: number[]): number {
  let best = tones[0];
  let bestDist = 99;
  for (const m of tones) {
    const d = Math.abs(m - prev);
    if (d < bestDist && d <= 7) {
      bestDist = d;
      best = m;
    }
  }
  return best;
}

function genBarMelody(
  style: string,
  tones: number[],
  prev: number,
): Omit<MelodyNote, "bar">[] {
  if (style === "simple")
    return [0, 1, 2, 3].map((b) => {
      const midi = voiceLead(prev, tones);
      return { beatOffset: b, midi, durationBeats: 0.9 };
    });
  if (style === "arpeggio") {
    const s = [...tones].sort((a, b) => a - b);
    return [0, 1, 2, 3, 1, 2, 0, 1].map((ti, i) => ({
      beatOffset: i * 0.5,
      midi: s[ti % s.length],
      durationBeats: 0.45,
    }));
  }
  if (style === "ambient")
    return [{ beatOffset: 0, midi: tones[0], durationBeats: 4.0 }];
  if (style === "lead")
    return ([
      [0, 1.0],
      [1.5, 0.5],
      [2, 0.75],
      [3, 1.0],
    ] as [number, number][]).map(([b, d]) => ({
      beatOffset: b,
      midi: voiceLead(prev, tones),
      durationBeats: d,
    }));
  if (style === "rhythmic")
    return [0, 0.75, 1.5, 2, 2.75, 3.5].map((b) => ({
      beatOffset: b,
      midi: voiceLead(prev, tones),
      durationBeats: 0.22,
    }));
  return [];
}

export function generateMelody(
  chords: string[],
  key: string,
  style: string,
): MelodyNote[] {
  keyScale(key); // ensure scale is computed (side-effect free here)
  let prev = 72;
  const notes: MelodyNote[] = [];
  chords.forEach((chord, barIdx) => {
    const tones = chordTones(chord);
    const barNotes = genBarMelody(style, tones, prev);
    barNotes.forEach((n) => notes.push({ bar: barIdx, ...n }));
    if (barNotes.length) prev = barNotes[barNotes.length - 1].midi;
  });
  return notes;
}

export function playMelodyNote(midi: number, t: number, dur: number): void {
  const ctx = ensureAudioGraph();
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.connect(amp);
  amp.connect(getMelodyGain()!);
  const atk = Math.min(0.015, dur * 0.08);
  const rel = Math.min(dur * 0.35, 0.5);
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.75, t + atk);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
  osc.start(t);
  osc.stop(t + dur + rel + 0.05);
}
