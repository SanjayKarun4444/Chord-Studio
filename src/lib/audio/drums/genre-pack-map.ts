import type { PackId } from "./types";

const GENRE_TO_PACK: Record<string, PackId> = {
  trap: "trap",
  drill: "drill",
  lofi: "lofi",
  "lo-fi": "lofi",
  boomBap: "boom_bap",
  "boom bap": "boom_bap",
  hiphop: "boom_bap",
  "hip-hop": "boom_bap",
  "hip hop": "boom_bap",
  rnb: "rnb",
  "r&b": "rnb",
  soul: "rnb",
  jazz: "jazz",
  gospel: "gospel",
  house: "house",
  funk: "funk",
  afrobeats: "afrobeats",
  amapiano: "afrobeats",
  reggaeton: "trap",
  dancehall: "boom_bap",
};

export function getPackForGenre(genre: string): PackId {
  const key = genre.toLowerCase().trim();
  return GENRE_TO_PACK[key] ?? "common";
}
