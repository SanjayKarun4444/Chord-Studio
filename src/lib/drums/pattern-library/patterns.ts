import type { StepGridPattern, StepData, StepTrack } from "./types";

// Helper: create a step track from a sparse map of step->velocity
// Steps not mentioned default to { velocity: 0, probability: 0 }
function track(totalSteps: number, hits: Record<number, number | [number, number]>): StepTrack {
  const steps: StepData[] = Array.from({ length: totalSteps }, () => ({ velocity: 0, probability: 0 }));
  for (const [step, val] of Object.entries(hits)) {
    const idx = parseInt(step);
    if (idx < totalSteps) {
      if (typeof val === "number") {
        steps[idx] = { velocity: val, probability: 1.0 };
      } else {
        steps[idx] = { velocity: val[0], probability: val[1] };
      }
    }
  }
  return { steps };
}

// Shorthand for empty track
function empty(totalSteps: number): StepTrack {
  return track(totalSteps, {});
}

// ────────────────────────────────────────────
// 31 Patterns
// ────────────────────────────────────────────

const ROCK_BEAT: StepGridPattern = {
  id: "rock-beat",
  name: "Rock Beat",
  genreTags: ["rock", "pop", "alternative"],
  category: "rock-pop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [80, 140],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 8: 1.0 }),                          // beats 1, 3
    snare: track(16, { 4: 1.0, 12: 1.0 }),                         // beats 2, 4
    hihat: track(16, { 0: 0.8, 2: 0.6, 4: 0.8, 6: 0.6, 8: 0.8, 10: 0.6, 12: 0.8, 14: 0.6 }), // 8ths
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Classic rock backbeat", difficulty: "basic", intensityRange: [0.5, 1.0] },
};

const FOUR_ON_FLOOR: StepGridPattern = {
  id: "four-on-floor",
  name: "Four-on-the-Floor",
  genreTags: ["dance", "pop", "disco", "edm"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [115, 135],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 4: 1.0, 8: 1.0, 12: 1.0 }),       // every beat
    snare: empty(16),
    hihat: track(16, { 2: 0.7, 6: 0.7, 10: 0.7, 14: 0.7 }),      // off-beat 8ths
    clap:  track(16, { 4: 1.0, 12: 1.0 }),                         // 2, 4
    ohat:  empty(16),
  },
  metadata: { description: "Dance floor staple", difficulty: "basic", intensityRange: [0.6, 1.0] },
};

const BOOM_BAP: StepGridPattern = {
  id: "boom-bap",
  name: "Boom Bap",
  genreTags: ["hiphop", "boomBap", "rap"],
  category: "hip-hop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [80, 100],
  swingCapable: true,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 5: 0.7, 10: 0.9 }),                // syncopated
    snare: track(16, { 4: 1.0, 12: 1.0, 7: [0.3, 0.6] }),         // 2,4 + ghost
    hihat: track(16, { 0: 0.8, 2: 0.6, 4: 0.8, 6: 0.6, 8: 0.8, 10: 0.6, 12: 0.8, 14: 0.6 }),
    clap:  empty(16),
    ohat:  track(16, { 6: [0.5, 0.7] }),
  },
  metadata: { description: "Classic hip-hop groove with syncopated kick", difficulty: "intermediate", intensityRange: [0.4, 0.9] },
};

const TRAP_BEAT: StepGridPattern = {
  id: "trap-beat",
  name: "Trap Beat",
  genreTags: ["trap", "hiphop", "rap"],
  category: "hip-hop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [120, 160],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 7: 0.8, 10: 0.9 }),                // sparse, syncopated
    snare: track(16, { 4: 1.0, 12: 1.0 }),
    hihat: track(16, { 0: 0.9, 1: 0.5, 2: 0.9, 3: 0.5, 4: 0.9, 5: 0.5, 6: 0.9, 7: 0.5, 8: 0.9, 9: 0.5, 10: 0.9, 11: 0.5, 12: 0.9, 13: 0.5, 14: 0.9, 15: 0.5 }), // rapid 16ths
    clap:  track(16, { 4: 0.9, 12: 0.9 }),
    ohat:  empty(16),
  },
  metadata: { description: "Modern trap with rapid hi-hat rolls", difficulty: "basic", intensityRange: [0.5, 1.0] },
};

const FUNK_GROOVE: StepGridPattern = {
  id: "funk-groove",
  name: "Funk Groove",
  genreTags: ["funk", "soul", "rnb"],
  category: "rock-pop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [90, 115],
  swingCapable: true,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 3: 0.6, 6: 0.7, 10: 0.9 }),       // syncopated 16th kick
    snare: track(16, { 4: 1.0, 12: 1.0, 7: [0.25, 0.8], 11: [0.25, 0.7], 15: [0.3, 0.6] }), // ghost notes
    hihat: track(16, { 0: 0.8, 1: 0.4, 2: 0.7, 3: 0.4, 4: 0.8, 5: 0.4, 6: 0.7, 7: 0.4, 8: 0.8, 9: 0.4, 10: 0.7, 11: 0.4, 12: 0.8, 13: 0.4, 14: 0.7, 15: 0.4 }),
    clap:  empty(16),
    ohat:  track(16, { 2: [0.5, 0.5] }),
  },
  metadata: { description: "Tight 16th-note funk with ghost snares", difficulty: "advanced", intensityRange: [0.5, 1.0] },
};

const SHUFFLE: StepGridPattern = {
  id: "shuffle",
  name: "Shuffle",
  genreTags: ["blues", "rock", "shuffle"],
  category: "rock-pop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [100, 140],
  swingCapable: true,
  stepsPerBeat: 3,   // triplet grid
  totalSteps: 12,
  tracks: {
    kick:  track(12, { 0: 1.0, 6: 1.0 }),                          // beats 1, 3
    snare: track(12, { 3: 1.0, 9: 1.0 }),                          // beats 2, 4
    hihat: track(12, { 0: 0.8, 2: 0.5, 3: 0.8, 5: 0.5, 6: 0.8, 8: 0.5, 9: 0.8, 11: 0.5 }), // swing pattern
    clap:  empty(12),
    ohat:  empty(12),
  },
  metadata: { description: "Triplet-feel shuffle groove", difficulty: "intermediate", intensityRange: [0.4, 0.9] },
};

const HALF_TIME_SHUFFLE: StepGridPattern = {
  id: "half-time-shuffle",
  name: "Half-Time Shuffle",
  genreTags: ["blues", "jazz", "fusion"],
  category: "jazz-world",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [60, 100],
  swingCapable: true,
  stepsPerBeat: 3,
  totalSteps: 12,
  tracks: {
    kick:  track(12, { 0: 1.0, 8: [0.6, 0.7] }),                  // beat 1 + ghost
    snare: track(12, { 6: 1.0, 2: [0.2, 0.6], 5: [0.25, 0.7], 8: [0.2, 0.5], 11: [0.25, 0.6] }), // snare on 3 + triplet ghosts
    hihat: track(12, { 0: 0.8, 2: 0.4, 3: 0.7, 5: 0.4, 6: 0.8, 8: 0.4, 9: 0.7, 11: 0.4 }),
    clap:  empty(12),
    ohat:  empty(12),
  },
  metadata: { description: "Rosanna/Purdie-style half-time shuffle", difficulty: "advanced", intensityRange: [0.3, 0.8] },
};

const JAZZ_SWING: StepGridPattern = {
  id: "jazz-swing",
  name: "Jazz Swing",
  genreTags: ["jazz", "swing", "bebop"],
  category: "jazz-world",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [100, 200],
  swingCapable: true,
  stepsPerBeat: 3,
  totalSteps: 12,
  tracks: {
    kick:  track(12, { 0: [0.5, 0.7], 5: [0.4, 0.5], 8: [0.5, 0.6] }), // comp kicks
    snare: track(12, { 5: [0.3, 0.5], 11: [0.3, 0.5] }),           // ghost comping
    hihat: track(12, { 0: 0.8, 2: 0.5, 3: 0.8, 5: 0.5, 6: 0.8, 8: 0.5, 9: 0.8, 11: 0.5 }), // ride pattern
    clap:  empty(12),
    ohat:  empty(12),
  },
  metadata: { description: "Ride cymbal jazz swing with kick comping", difficulty: "advanced", intensityRange: [0.2, 0.7] },
};

const BOSSA_NOVA: StepGridPattern = {
  id: "bossa-nova",
  name: "Bossa Nova",
  genreTags: ["bossa", "bossaNova", "latin", "jazz"],
  category: "latin",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [120, 145],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 0.8, 3: 0.6, 6: 0.8, 10: 0.7, 12: 0.6 }), // bossa kick pattern
    snare: track(16, { 2: 0.4, 6: 0.4, 10: 0.4, 14: 0.4 }),      // cross-stick
    hihat: track(16, { 0: 0.6, 2: 0.5, 4: 0.6, 6: 0.5, 8: 0.6, 10: 0.5, 12: 0.6, 14: 0.5 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Brazilian bossa nova with cross-stick and syncopated kick", difficulty: "intermediate", intensityRange: [0.3, 0.7] },
};

const SAMBA: StepGridPattern = {
  id: "samba",
  name: "Samba",
  genreTags: ["samba", "brazilian", "latin"],
  category: "latin",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [90, 110],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 2: 0.5, 4: 0.7, 6: 0.5, 8: 1.0, 10: 0.5, 12: 0.7, 14: 0.5 }), // surdo
    snare: track(16, { 2: 0.6, 4: 0.7, 6: 0.4, 10: 0.6, 12: 0.7, 14: 0.4 }),
    hihat: track(16, { 0: 0.7, 1: 0.4, 2: 0.6, 3: 0.4, 4: 0.7, 5: 0.4, 6: 0.6, 7: 0.4, 8: 0.7, 9: 0.4, 10: 0.6, 11: 0.4, 12: 0.7, 13: 0.4, 14: 0.6, 15: 0.4 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Dense samba groove with surdo kick pattern", difficulty: "intermediate", intensityRange: [0.5, 1.0] },
};

const REGGAE_ONE_DROP: StepGridPattern = {
  id: "reggae-one-drop",
  name: "Reggae One Drop",
  genreTags: ["reggae", "dub", "roots"],
  category: "jazz-world",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [65, 85],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 8: 1.0 }),                                   // kick on beat 3 only
    snare: track(16, { 8: 0.9 }),                                   // snare on beat 3 with kick
    hihat: track(16, { 0: 0.6, 2: 0.5, 4: 0.6, 6: 0.5, 8: 0.6, 10: 0.5, 12: 0.6, 14: 0.5 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "No beat 1 kick - iconic reggae one drop", difficulty: "basic", intensityRange: [0.3, 0.7] },
};

const REGGAE_STEPPERS: StepGridPattern = {
  id: "reggae-steppers",
  name: "Reggae Steppers",
  genreTags: ["reggae", "dub"],
  category: "jazz-world",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [70, 90],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 4: 0.9, 8: 1.0, 12: 0.9 }),       // kick every beat
    snare: track(16, { 8: 1.0 }),                                   // snare on 3
    hihat: track(16, { 0: 0.6, 2: 0.5, 4: 0.6, 6: 0.5, 8: 0.6, 10: 0.5, 12: 0.6, 14: 0.5 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Driving reggae steppers with four-on-floor kick", difficulty: "basic", intensityRange: [0.4, 0.8] },
};

const REGGAETON: StepGridPattern = {
  id: "reggaeton",
  name: "Reggaeton (Dembow)",
  genreTags: ["reggaeton", "latin", "dembow"],
  category: "latin",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [88, 98],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 8: 1.0 }),                          // 1, 3
    snare: track(16, { 3: 0.9, 7: 0.9, 11: 0.9, 15: 0.9 }),       // off-beat snares (dembow)
    hihat: track(16, { 0: 0.7, 1: 0.4, 2: 0.7, 3: 0.4, 4: 0.7, 5: 0.4, 6: 0.7, 7: 0.4, 8: 0.7, 9: 0.4, 10: 0.7, 11: 0.4, 12: 0.7, 13: 0.4, 14: 0.7, 15: 0.4 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Dembow riddim with off-beat snare pattern", difficulty: "basic", intensityRange: [0.6, 1.0] },
};

const DISCO_BEAT: StepGridPattern = {
  id: "disco-beat",
  name: "Disco Beat",
  genreTags: ["disco", "dance", "funk"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [110, 130],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 4: 1.0, 8: 1.0, 12: 1.0 }),       // four on floor
    snare: track(16, { 4: 0.9, 12: 0.9 }),
    hihat: track(16, { 0: 0.8, 2: 0.7, 4: 0.8, 6: 0.7, 8: 0.8, 10: 0.7, 12: 0.8, 14: 0.7 }),
    clap:  empty(16),
    ohat:  track(16, { 2: 0.7, 6: 0.7, 10: 0.7, 14: 0.7 }),       // open hats on off-beats
  },
  metadata: { description: "Classic disco with open hat off-beats", difficulty: "basic", intensityRange: [0.6, 1.0] },
};

const MOTOWN_GROOVE: StepGridPattern = {
  id: "motown-groove",
  name: "Motown Groove",
  genreTags: ["motown", "soul", "rnb"],
  category: "rock-pop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [95, 120],
  swingCapable: true,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 8: 0.9 }),                          // 1, 3
    snare: empty(16),
    hihat: track(16, { 0: 0.6, 2: 0.5, 4: 0.6, 6: 0.5, 8: 0.6, 10: 0.5, 12: 0.6, 14: 0.5 }), // tambourine 8ths
    clap:  track(16, { 4: 1.0, 12: 1.0 }),                         // clap 2, 4
    ohat:  empty(16),
  },
  metadata: { description: "Motown backbeat with clap and tambourine", difficulty: "basic", intensityRange: [0.4, 0.9] },
};

const PUNK_DBEAT: StepGridPattern = {
  id: "punk-dbeat",
  name: "Punk (D-Beat)",
  genreTags: ["punk", "hardcore"],
  category: "rock-pop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [150, 200],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 2: 0.9, 4: 0.8, 6: 0.9, 8: 1.0, 10: 0.9, 12: 0.8, 14: 0.9 }), // driving 8ths
    snare: track(16, { 2: 0.9, 6: 0.9, 10: 0.9, 14: 0.9 }),       // snare offbeats
    hihat: track(16, { 0: 0.9, 2: 0.8, 4: 0.9, 6: 0.8, 8: 0.9, 10: 0.8, 12: 0.9, 14: 0.8 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Driving punk D-beat with aggressive 8th-note kick", difficulty: "basic", intensityRange: [0.8, 1.0] },
};

const METAL_DOUBLE_BASS: StepGridPattern = {
  id: "metal-double-bass",
  name: "Metal Double Bass",
  genreTags: ["metal", "heavyMetal"],
  category: "rock-pop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [120, 180],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 1: 0.8, 2: 1.0, 3: 0.8, 4: 1.0, 5: 0.8, 6: 1.0, 7: 0.8, 8: 1.0, 9: 0.8, 10: 1.0, 11: 0.8, 12: 1.0, 13: 0.8, 14: 1.0, 15: 0.8 }), // 16th kicks
    snare: track(16, { 4: 1.0, 12: 1.0 }),                         // 2, 4
    hihat: track(16, { 0: 0.9, 2: 0.7, 4: 0.9, 6: 0.7, 8: 0.9, 10: 0.7, 12: 0.9, 14: 0.7 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Relentless 16th-note double bass kicks", difficulty: "advanced", intensityRange: [0.8, 1.0] },
};

const BREAKBEAT: StepGridPattern = {
  id: "breakbeat",
  name: "Breakbeat",
  genreTags: ["breakbeat", "breaks", "electronic"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [110, 140],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 6: 0.8, 10: 0.9 }),                // displaced kick
    snare: track(16, { 4: 1.0, 11: 0.8, 14: [0.6, 0.7] }),        // displaced snare
    hihat: track(16, { 0: 0.7, 2: 0.6, 4: 0.7, 6: 0.6, 8: 0.7, 10: 0.6, 12: 0.7, 14: 0.6 }),
    clap:  empty(16),
    ohat:  track(16, { 8: [0.5, 0.6] }),
  },
  metadata: { description: "Broken beat pattern with displaced snare", difficulty: "intermediate", intensityRange: [0.5, 1.0] },
};

const AMEN_BREAK: StepGridPattern = {
  id: "amen-break",
  name: "Amen Break",
  genreTags: ["jungle", "dnb", "breakbeat"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [130, 180],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 4: 0.7, 10: 0.9 }),
    snare: track(16, { 4: 1.0, 7: 0.7, 10: 0.8, 14: 0.9 }),
    hihat: track(16, { 0: 0.8, 2: 0.7, 4: 0.6, 6: 0.8, 8: 0.7, 10: 0.6, 12: 0.8, 14: 0.7 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Iconic Amen break kick/snare/hat interplay", difficulty: "intermediate", intensityRange: [0.6, 1.0] },
};

const DRUM_AND_BASS: StepGridPattern = {
  id: "drum-and-bass",
  name: "Drum and Bass",
  genreTags: ["dnb", "jungle", "electronic"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [160, 180],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 10: 0.9 }),                         // two-step kick
    snare: track(16, { 4: 1.0, 12: 1.0 }),                         // snare on 2 and 4
    hihat: track(16, { 0: 0.7, 1: 0.4, 2: 0.7, 3: 0.4, 4: 0.7, 5: 0.4, 6: 0.7, 7: 0.4, 8: 0.7, 9: 0.4, 10: 0.7, 11: 0.4, 12: 0.7, 13: 0.4, 14: 0.7, 15: 0.4 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Fast two-step DnB with driving hats", difficulty: "intermediate", intensityRange: [0.6, 1.0] },
};

const AFROBEAT: StepGridPattern = {
  id: "afrobeat",
  name: "Afrobeat",
  genreTags: ["afrobeat", "african", "afrobeats"],
  category: "jazz-world",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [95, 115],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 3: 0.6, 7: 0.7, 10: 0.9, 14: [0.5, 0.7] }), // asymmetric
    snare: track(16, { 4: 0.9, 12: 0.9, 7: [0.3, 0.6] }),
    hihat: track(16, { 0: 0.7, 1: 0.3, 2: 0.6, 3: 0.3, 4: 0.7, 5: 0.3, 6: 0.6, 7: 0.3, 8: 0.7, 9: 0.3, 10: 0.6, 11: 0.3, 12: 0.7, 13: 0.3, 14: 0.6, 15: 0.3 }),
    clap:  track(16, { 4: [0.6, 0.5], 12: [0.6, 0.5] }),
    ohat:  track(16, { 6: [0.4, 0.6], 14: [0.4, 0.6] }),
  },
  metadata: { description: "Polyrhythmic afrobeat with asymmetric kick", difficulty: "advanced", intensityRange: [0.5, 1.0] },
};

const SECOND_LINE: StepGridPattern = {
  id: "second-line",
  name: "New Orleans Second Line",
  genreTags: ["secondLine", "newOrleans", "funk"],
  category: "jazz-world",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [100, 130],
  swingCapable: true,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 8: 0.9 }),
    snare: track(16, { 3: 0.6, 4: 1.0, 6: 0.5, 7: 0.4, 10: 0.5, 11: 0.6, 12: 1.0, 15: 0.5 }), // syncopated rolls
    hihat: track(16, { 0: 0.7, 2: 0.5, 4: 0.7, 6: 0.5, 8: 0.7, 10: 0.5, 12: 0.7, 14: 0.5 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Syncopated New Orleans second line snare pattern", difficulty: "advanced", intensityRange: [0.5, 1.0] },
};

const WALTZ: StepGridPattern = {
  id: "waltz",
  name: "Waltz",
  genreTags: ["waltz", "classical", "folk"],
  category: "misc",
  timeSignature: { numerator: 3, denominator: 4 },
  bpmRange: [80, 140],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 12,
  tracks: {
    kick:  track(12, { 0: 1.0 }),                                   // beat 1
    snare: empty(12),
    hihat: track(12, { 4: 0.6, 8: 0.6 }),                          // beats 2, 3
    clap:  empty(12),
    ohat:  empty(12),
  },
  metadata: { description: "Simple waltz in 3/4 time", difficulty: "basic", intensityRange: [0.3, 0.7] },
};

const SIX_EIGHT_BALLAD: StepGridPattern = {
  id: "6-8-ballad",
  name: "6/8 Ballad",
  genreTags: ["ballad", "slow", "6/8"],
  category: "misc",
  timeSignature: { numerator: 6, denominator: 8 },
  bpmRange: [50, 80],
  swingCapable: false,
  stepsPerBeat: 2,    // 2 subdivisions per 8th-note beat
  totalSteps: 12,     // 6 beats * 2
  tracks: {
    kick:  track(12, { 0: 1.0, 6: 0.8 }),                          // beat 1 and 4
    snare: track(12, { 6: [0.4, 0.6] }),                            // light ghost on 4
    hihat: track(12, { 0: 0.7, 2: 0.5, 4: 0.5, 6: 0.7, 8: 0.5, 10: 0.5 }), // groups of 3
    clap:  empty(12),
    ohat:  empty(12),
  },
  metadata: { description: "6/8 time ballad feel with two groups of three", difficulty: "basic", intensityRange: [0.2, 0.6] },
};

const SOCA: StepGridPattern = {
  id: "soca",
  name: "Soca",
  genreTags: ["soca", "caribbean", "dancehall"],
  category: "latin",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [140, 165],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 4: 0.8, 8: 1.0, 12: 0.8 }),       // driving
    snare: track(16, { 4: 1.0, 12: 1.0 }),
    hihat: track(16, { 0: 0.8, 1: 0.4, 2: 0.7, 3: 0.4, 4: 0.8, 5: 0.4, 6: 0.7, 7: 0.4, 8: 0.8, 9: 0.4, 10: 0.7, 11: 0.4, 12: 0.8, 13: 0.4, 14: 0.7, 15: 0.4 }),
    clap:  empty(16),
    ohat:  empty(16),
  },
  metadata: { description: "Driving soca party beat", difficulty: "basic", intensityRange: [0.7, 1.0] },
};

const CALYPSO: StepGridPattern = {
  id: "calypso",
  name: "Calypso",
  genreTags: ["calypso", "caribbean", "tropical"],
  category: "latin",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [100, 130],
  swingCapable: true,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 0.9, 6: 0.6, 10: 0.7 }),                // lighter syncopation
    snare: track(16, { 4: 0.8, 12: 0.8 }),
    hihat: track(16, { 0: 0.6, 2: 0.5, 4: 0.6, 6: 0.5, 8: 0.6, 10: 0.5, 12: 0.6, 14: 0.5 }),
    clap:  empty(16),
    ohat:  track(16, { 6: [0.4, 0.6], 14: [0.4, 0.6] }),
  },
  metadata: { description: "Lighter calypso groove with subtle syncopation", difficulty: "basic", intensityRange: [0.4, 0.8] },
};

const G_FUNK: StepGridPattern = {
  id: "g-funk",
  name: "G-Funk",
  genreTags: ["gfunk", "hiphop", "westcoast"],
  category: "hip-hop",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [80, 100],
  swingCapable: true,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 6: 0.7, 10: 0.8 }),                // bouncy
    snare: track(16, { 4: 1.0, 12: 1.0 }),
    hihat: track(16, { 0: 0.7, 2: 0.5, 4: 0.7, 6: 0.5, 8: 0.7, 10: 0.5, 12: 0.7, 14: 0.5 }),
    clap:  track(16, { 4: 0.8, 12: 0.8 }),
    ohat:  track(16, { 2: [0.4, 0.5] }),
  },
  metadata: { description: "Laid-back West Coast bouncy groove", difficulty: "basic", intensityRange: [0.4, 0.8] },
};

const UK_GARAGE: StepGridPattern = {
  id: "uk-garage",
  name: "UK Garage (2-Step)",
  genreTags: ["ukGarage", "2step", "garage"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [130, 140],
  swingCapable: true,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 2: 0.9, 10: 0.8 }),                         // kick avoids beat 1
    snare: track(16, { 4: 1.0, 12: 1.0 }),
    hihat: track(16, { 0: 0.7, 3: 0.5, 4: 0.7, 7: 0.5, 8: 0.7, 11: 0.5, 12: 0.7, 15: 0.5 }), // shuffled
    clap:  empty(16),
    ohat:  track(16, { 6: [0.5, 0.7], 14: [0.5, 0.7] }),
  },
  metadata: { description: "2-step garage with shuffled hats and displaced kick", difficulty: "intermediate", intensityRange: [0.5, 0.9] },
};

const JERSEY_CLUB: StepGridPattern = {
  id: "jersey-club",
  name: "Jersey Club",
  genreTags: ["jerseyClub", "club", "dance"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [130, 145],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 8: 0.9 }),
    snare: track(16, { 2: 0.7, 3: 0.6, 4: 1.0, 6: 0.5, 7: 0.6, 10: 0.7, 11: 0.6, 12: 1.0, 14: 0.5, 15: 0.6 }), // rapid rolls
    hihat: track(16, { 0: 0.7, 2: 0.6, 4: 0.7, 6: 0.6, 8: 0.7, 10: 0.6, 12: 0.7, 14: 0.6 }),
    clap:  track(16, { 4: 0.8, 12: 0.8 }),
    ohat:  empty(16),
  },
  metadata: { description: "Jersey club with rapid snare rolls", difficulty: "intermediate", intensityRange: [0.7, 1.0] },
};

const HOUSE_BEAT: StepGridPattern = {
  id: "house-beat",
  name: "House Beat",
  genreTags: ["house", "deepHouse", "electronic"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [120, 130],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 4: 1.0, 8: 1.0, 12: 1.0 }),       // four on floor
    snare: empty(16),
    hihat: track(16, { 2: 0.7, 6: 0.7, 10: 0.7, 14: 0.7 }),      // off-beat hats
    clap:  track(16, { 4: 1.0, 12: 1.0 }),                         // clap 2,4
    ohat:  track(16, { 2: [0.4, 0.5], 6: [0.4, 0.5], 10: [0.4, 0.5], 14: [0.4, 0.5] }),
  },
  metadata: { description: "Classic house beat with four-on-floor and claps", difficulty: "basic", intensityRange: [0.6, 1.0] },
};

const TECHNO_BEAT: StepGridPattern = {
  id: "techno-beat",
  name: "Techno Beat",
  genreTags: ["techno", "industrial", "electronic"],
  category: "electronic",
  timeSignature: { numerator: 4, denominator: 4 },
  bpmRange: [125, 145],
  swingCapable: false,
  stepsPerBeat: 4,
  totalSteps: 16,
  tracks: {
    kick:  track(16, { 0: 1.0, 4: 1.0, 8: 1.0, 12: 1.0 }),       // mechanical four-on-floor
    snare: track(16, { 4: 0.7, 12: 0.7 }),                         // snare/rim 2,4
    hihat: track(16, { 0: 0.8, 2: 0.8, 4: 0.8, 6: 0.8, 8: 0.8, 10: 0.8, 12: 0.8, 14: 0.8 }), // steady 8ths
    clap:  track(16, { 4: 0.9, 12: 0.9 }),
    ohat:  track(16, { 2: [0.5, 0.6], 14: [0.5, 0.6] }),
  },
  metadata: { description: "Mechanical techno four-on-floor", difficulty: "basic", intensityRange: [0.7, 1.0] },
};

// ────────────────────────────────────────────
// Exports
// ────────────────────────────────────────────

export const PATTERN_LIBRARY: StepGridPattern[] = [
  ROCK_BEAT,
  FOUR_ON_FLOOR,
  BOOM_BAP,
  TRAP_BEAT,
  FUNK_GROOVE,
  SHUFFLE,
  HALF_TIME_SHUFFLE,
  JAZZ_SWING,
  BOSSA_NOVA,
  SAMBA,
  REGGAE_ONE_DROP,
  REGGAE_STEPPERS,
  REGGAETON,
  DISCO_BEAT,
  MOTOWN_GROOVE,
  PUNK_DBEAT,
  METAL_DOUBLE_BASS,
  BREAKBEAT,
  AMEN_BREAK,
  DRUM_AND_BASS,
  AFROBEAT,
  SECOND_LINE,
  WALTZ,
  SIX_EIGHT_BALLAD,
  SOCA,
  CALYPSO,
  G_FUNK,
  UK_GARAGE,
  JERSEY_CLUB,
  HOUSE_BEAT,
  TECHNO_BEAT,
];

export const PATTERN_MAP: Record<string, StepGridPattern> = Object.fromEntries(
  PATTERN_LIBRARY.map((p) => [p.id, p]),
);

export type PatternCategory = StepGridPattern["category"];

export const PATTERN_CATEGORIES: { id: PatternCategory; label: string }[] = [
  { id: "rock-pop", label: "Rock / Pop" },
  { id: "hip-hop", label: "Hip-Hop" },
  { id: "electronic", label: "Electronic" },
  { id: "latin", label: "Latin" },
  { id: "jazz-world", label: "Jazz / World" },
  { id: "misc", label: "Misc" },
];
