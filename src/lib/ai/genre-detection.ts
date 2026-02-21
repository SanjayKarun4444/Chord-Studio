export function detectGenre(message: string): string | null {
  const m = message.toLowerCase();

  // Multi-word patterns first to avoid substring false matches
  if (m.includes("boom bap") || m.includes("boombap")) return "boomBap";
  if (m.includes("neo soul") || m.includes("neo-soul")) return "rnb";
  if (m.includes("hip hop") || m.includes("hip-hop") || m.includes("hiphop"))
    return "hiphop";
  if (m.includes("lo-fi") || m.includes("lofi")) return "lofi";
  if (m.includes("latin trap")) return "reggaeton";
  if (m.includes("reggaeton") || m.includes("dembow") || m.includes("perreo"))
    return "reggaeton";
  if (m.includes("dancehall")) return "dancehall";
  if (m.includes("amapiano")) return "amapiano";
  if (m.includes("afrobeats") || m.includes("afro beat")) return "afrobeats";
  if (m.includes("r&b") || m.includes("rnb")) return "rnb";
  if (m.includes("gospel")) return "gospel";
  if (m.includes("jazz")) return "jazz";
  if (m.includes("house")) return "house";
  if (m.includes("funk")) return "funk";
  if (m.includes("soul")) return "soul";
  if (m.includes("drill")) return "drill";
  if (m.includes("trap")) return "trap";
  if (m.includes("afro")) return "afrobeats";
  return null;
}
