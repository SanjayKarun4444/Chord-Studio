import { NOTE_MIDI_MAP, WHITE_NOTES, BLACK_OFFSETS } from "./constants";
import type { PianoKey } from "./types";

export function chordToMidi(chordName: string): number[] {
  const m = chordName.match(/^[A-G][#b]?/);
  if (!m) return [];
  const r = NOTE_MIDI_MAP[m[0]] || 60;
  if (chordName.includes("m7") && !chordName.includes("maj"))
    return [r, r + 3, r + 7, r + 10];
  if (chordName.includes("maj7") || chordName.includes("maj9"))
    return [r, r + 4, r + 7, r + 11];
  if (chordName.includes("9")) return [r, r + 4, r + 7, r + 10, r + 14];
  if (chordName.includes("7")) return [r, r + 4, r + 7, r + 10];
  if (chordName.includes("dim")) return [r, r + 3, r + 6];
  if (chordName.includes("aug")) return [r, r + 4, r + 8];
  if (chordName.includes("sus2")) return [r, r + 2, r + 7];
  if (chordName.includes("sus4")) return [r, r + 5, r + 7];
  if (chordName.includes("m")) return [r, r + 3, r + 7];
  return [r, r + 4, r + 7];
}

export function normalizeToDisplayRange(midiArr: number[]): number[] {
  return midiArr.map((m) => {
    let n = m;
    while (n < 60) n += 12;
    while (n > 83) n -= 12;
    return n;
  });
}

export function buildPianoKeys(): PianoKey[] {
  const keys: PianoKey[] = [];
  let whiteIdx = 0;
  for (let oct = 4; oct <= 5; oct++) {
    WHITE_NOTES.forEach((note) => {
      const midi = NOTE_MIDI_MAP[note] + (oct - 4) * 12;
      keys.push({
        type: "white",
        note: `${note}${oct}`,
        midi,
        whiteIdx: whiteIdx++,
      });
    });
  }
  Object.entries(BLACK_OFFSETS).forEach(([note, whitePos]) => {
    for (let oct = 4; oct <= 5; oct++) {
      const midi = NOTE_MIDI_MAP[note] + (oct - 4) * 12;
      const wIdx = whitePos + (oct - 4) * 7;
      keys.push({
        type: "black",
        note: `${note}${oct}`,
        midi,
        afterWhite: wIdx,
      });
    }
  });
  return keys;
}
