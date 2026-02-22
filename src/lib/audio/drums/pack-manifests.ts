import type { PackId, PackManifest, DrumType, SampleEntry } from "./types";

function entries(packId: string, type: DrumType, count: number, opts?: Partial<SampleEntry>): SampleEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    url: `/samples/drums/${packId}/${type}_${i + 1}.wav`,
    gain: opts?.gain,
    pitchCents: opts?.pitchCents,
  }));
}

const COMMON: PackManifest = {
  id: "common",
  label: "Common",
  drums: {
    kick:  entries("common", "kick", 2),
    snare: entries("common", "snare", 2),
    hihat: entries("common", "hihat", 3),
    ohat:  entries("common", "ohat", 2),
    clap:  entries("common", "clap", 2),
  },
};

const TRAP: PackManifest = {
  id: "trap",
  label: "Trap",
  drums: {
    kick:  entries("trap", "kick", 3),
    snare: entries("trap", "snare", 2),
    hihat: entries("trap", "hihat", 4),
    ohat:  entries("trap", "ohat", 2),
    clap:  entries("trap", "clap", 2),
  },
};

const LOFI: PackManifest = {
  id: "lofi",
  label: "Lo-Fi",
  drums: {
    kick:  entries("lofi", "kick", 2),
    snare: entries("lofi", "snare", 2),
    hihat: entries("lofi", "hihat", 3),
    ohat:  entries("lofi", "ohat", 2),
    clap:  entries("lofi", "clap", 2),
  },
};

const BOOM_BAP: PackManifest = {
  id: "boom_bap",
  label: "Boom Bap",
  drums: {
    kick:  entries("boom_bap", "kick", 2),
    snare: entries("boom_bap", "snare", 2),
    hihat: entries("boom_bap", "hihat", 3),
    ohat:  entries("boom_bap", "ohat", 2),
    clap:  entries("boom_bap", "clap", 2),
  },
};

const DRILL: PackManifest = {
  id: "drill",
  label: "Drill",
  drums: {
    kick:  entries("drill", "kick", 2),
    snare: entries("drill", "snare", 2),
    hihat: entries("drill", "hihat", 4),
    ohat:  entries("drill", "ohat", 2),
    clap:  entries("drill", "clap", 2),
  },
};

const JAZZ: PackManifest = {
  id: "jazz",
  label: "Jazz",
  drums: {
    kick:  entries("jazz", "kick", 2),
    snare: entries("jazz", "snare", 2),
    hihat: entries("jazz", "hihat", 3),
    ohat:  entries("jazz", "ohat", 2),
    clap:  entries("jazz", "clap", 2),
  },
};

const GOSPEL: PackManifest = {
  id: "gospel",
  label: "Gospel",
  drums: {
    kick:  entries("gospel", "kick", 2),
    snare: entries("gospel", "snare", 2),
    hihat: entries("gospel", "hihat", 3),
    ohat:  entries("gospel", "ohat", 2),
    clap:  entries("gospel", "clap", 2),
  },
};

const HOUSE: PackManifest = {
  id: "house",
  label: "House",
  drums: {
    kick:  entries("house", "kick", 2),
    snare: entries("house", "snare", 2),
    hihat: entries("house", "hihat", 3),
    ohat:  entries("house", "ohat", 2),
    clap:  entries("house", "clap", 2),
  },
};

const RNB: PackManifest = {
  id: "rnb",
  label: "R&B",
  drums: {
    kick:  entries("rnb", "kick", 2),
    snare: entries("rnb", "snare", 2),
    hihat: entries("rnb", "hihat", 3),
    ohat:  entries("rnb", "ohat", 2),
    clap:  entries("rnb", "clap", 2),
  },
};

const AFROBEATS: PackManifest = {
  id: "afrobeats",
  label: "Afrobeats",
  drums: {
    kick:  entries("afrobeats", "kick", 2),
    snare: entries("afrobeats", "snare", 2),
    hihat: entries("afrobeats", "hihat", 3),
    ohat:  entries("afrobeats", "ohat", 2),
    clap:  entries("afrobeats", "clap", 2),
  },
};

const FUNK: PackManifest = {
  id: "funk",
  label: "Funk",
  drums: {
    kick:  entries("funk", "kick", 2),
    snare: entries("funk", "snare", 2),
    hihat: entries("funk", "hihat", 3),
    ohat:  entries("funk", "ohat", 2),
    clap:  entries("funk", "clap", 2),
  },
};

export const PACK_REGISTRY: Record<PackId, PackManifest> = {
  common: COMMON,
  trap: TRAP,
  lofi: LOFI,
  boom_bap: BOOM_BAP,
  drill: DRILL,
  jazz: JAZZ,
  gospel: GOSPEL,
  house: HOUSE,
  rnb: RNB,
  afrobeats: AFROBEATS,
  funk: FUNK,
};
