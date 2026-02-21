import { chordToMidi } from "./chord-utils";
import type { Progression, MidiEvent } from "./types";

const TPB = 480;

function encVL(v: number): number[] {
  const b: number[] = [];
  let val = v;
  let buf = val & 0x7f;
  while ((val >>= 7)) {
    buf <<= 8;
    buf |= (val & 0x7f) | 0x80;
  }
  while (true) {
    b.push(buf & 0xff);
    if (buf & 0x80) buf >>= 8;
    else break;
  }
  return b;
}

function wrapMidi(
  tempo: number,
  ch: number,
  evts: MidiEvent[],
  label: string,
): Uint8Array {
  const mspb = Math.floor(60000000 / tempo);
  const ev: number[] = [
    0x00, 0xff, 0x51, 0x03,
    (mspb >> 16) & 0xff, (mspb >> 8) & 0xff, mspb & 0xff,
  ];
  const nb = Array.from(new TextEncoder().encode(label));
  ev.push(0x00, 0xff, 0x03, nb.length, ...nb);
  const sorted = [...evts].sort((a, b) =>
    a.tick !== b.tick ? a.tick - b.tick : a.type === "on" ? -1 : 1,
  );
  let last = 0;
  for (const e of sorted) {
    ev.push(...encVL(e.tick - last));
    ev.push(
      e.type === "on" ? 0x90 | (ch & 0xf) : 0x80 | (ch & 0xf),
      e.note & 0x7f,
      e.vel & 0x7f,
    );
    last = e.tick;
  }
  ev.push(0x00, 0xff, 0x2f, 0x00);
  const td = new Uint8Array(ev);
  const hdr = new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1,
    (TPB >> 8) & 0xff, TPB & 0xff,
  ]);
  const trkH = new Uint8Array([
    0x4d, 0x54, 0x72, 0x6b,
    (td.length >> 24) & 0xff, (td.length >> 16) & 0xff,
    (td.length >> 8) & 0xff, td.length & 0xff,
  ]);
  const out = new Uint8Array(hdr.length + trkH.length + td.length);
  out.set(hdr, 0);
  out.set(trkH, hdr.length);
  out.set(td, hdr.length + trkH.length);
  return out;
}

export function buildChordsMidi(prog: Progression): Uint8Array {
  const evts: MidiEvent[] = [];
  prog.chords.forEach((ch, bi) => {
    chordToMidi(ch).forEach((n) => {
      evts.push(
        { tick: bi * 4 * TPB, note: n, vel: 90, type: "on" },
        { tick: bi * 4 * TPB + TPB * 4 - 20, note: n, vel: 0, type: "off" },
      );
    });
  });
  return wrapMidi(prog.tempo, 0, evts, "Chords");
}

export function buildBassMidi(prog: Progression): Uint8Array {
  const evts: MidiEvent[] = [];
  prog.chords.forEach((ch, bi) => {
    const root = chordToMidi(ch)[0] - 12;
    evts.push(
      { tick: bi * 4 * TPB, note: root, vel: 95, type: "on" },
      { tick: bi * 4 * TPB + TPB * 2, note: root, vel: 0, type: "off" },
    );
    evts.push(
      { tick: bi * 4 * TPB + TPB * 2, note: root, vel: 80, type: "on" },
      { tick: bi * 4 * TPB + TPB * 4 - 20, note: root, vel: 0, type: "off" },
    );
  });
  return wrapMidi(prog.tempo, 1, evts, "Bass");
}

export function buildDrumsMidi(prog: Progression): Uint8Array {
  const d = prog.drums || { patternLengthBeats: 4, kicks: [], snares: [], hihats: [], claps: [], ohats: [] };
  const n = prog.chords.length;
  const pl = d.patternLengthBeats || 4;
  const evts: MidiEvent[] = [];
  (
    [
      [d.kicks || [], 36],
      [d.snares || [], 38],
      [d.hihats || [], 42],
      [d.claps || [], 39],
      [d.ohats || [], 46],
    ] as [number[], number][]
  ).forEach(([arr, note]) => {
    arr.forEach((pos) => {
      for (let b = 0; b < n; b++) {
        const tk = Math.round((b * 4 + (pos % pl)) * TPB);
        evts.push(
          { tick: tk, note, vel: 100, type: "on" },
          { tick: tk + Math.round(TPB * 0.45), note, vel: 0, type: "off" },
        );
      }
    });
  });
  return wrapMidi(prog.tempo, 9, evts, "Drums");
}

export function downloadBlob(data: Uint8Array, name: string): void {
  const url = URL.createObjectURL(new Blob([data as BlobPart], { type: "audio/midi" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
