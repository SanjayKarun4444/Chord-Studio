import type { StepGridPattern } from "../pattern-library/types";
import type { ProgressionFeatures } from "./analyzer";

export interface ScoreBreakdown {
  genre: number;
  bpm: number;
  timeSig: number;
  density: number;
  swing: number;
  mood: number;
}

export interface PatternScore {
  pattern: StepGridPattern;
  score: number;       // 0-100
  reasoning: string;
  breakdown: ScoreBreakdown;
}

// ─── Genre Affinity Map ───
// Each genre maps to related genres that get partial credit
const GENRE_AFFINITY: Record<string, string[]> = {
  trap:       ["drill", "hiphop", "rap"],
  drill:      ["trap", "hiphop", "rap"],
  hiphop:     ["trap", "boomBap", "rap", "gfunk", "westcoast"],
  rap:        ["hiphop", "trap", "drill", "boomBap"],
  boomBap:    ["hiphop", "lofi", "jazz"],
  lofi:       ["jazz", "boomBap", "chill"],
  house:      ["techno", "disco", "deepHouse", "dance", "edm"],
  deepHouse:  ["house", "techno", "garage"],
  techno:     ["house", "industrial", "electronic"],
  disco:      ["house", "funk", "dance"],
  jazz:       ["lofi", "soul", "bossaNova", "bossa", "swing", "bebop", "fusion"],
  gospel:     ["soul", "rnb"],
  soul:       ["gospel", "rnb", "motown", "funk"],
  rnb:        ["soul", "gospel", "hiphop"],
  funk:       ["soul", "disco", "secondLine"],
  rock:       ["alternative", "pop", "punk"],
  pop:        ["rock", "dance", "edm"],
  punk:       ["rock", "hardcore"],
  metal:      ["heavyMetal", "rock"],
  reggae:     ["dub", "roots", "dancehall"],
  dub:        ["reggae", "roots"],
  reggaeton:  ["latin", "dembow", "dancehall"],
  latin:      ["reggaeton", "samba", "bossa", "calypso", "soca"],
  bossa:      ["bossaNova", "jazz", "latin"],
  bossaNova:  ["bossa", "jazz", "latin"],
  samba:      ["brazilian", "latin"],
  afrobeat:   ["african", "afrobeats", "funk"],
  afrobeats:  ["afrobeat", "african", "dancehall"],
  dnb:        ["jungle", "breakbeat", "electronic"],
  jungle:     ["dnb", "breakbeat"],
  breakbeat:  ["breaks", "dnb", "jungle"],
  ukGarage:   ["2step", "garage", "house"],
  jerseyClub: ["club", "dance"],
  soca:       ["caribbean", "calypso", "dancehall"],
  calypso:    ["caribbean", "soca", "tropical"],
  waltz:      ["classical", "folk"],
  ballad:     ["slow", "pop"],
  edm:        ["electronic", "dance", "house"],
  electronic: ["edm", "house", "techno"],
};

// ─── Mood-to-Genre affinity ───
const MOOD_GENRE_MAP: Record<string, string[]> = {
  dark:       ["trap", "drill", "metal", "industrial", "dnb"],
  chill:      ["lofi", "bossa", "jazz", "deepHouse", "ambient"],
  uplifting:  ["house", "disco", "gospel", "soca", "pop"],
  aggressive: ["trap", "drill", "punk", "metal", "dnb"],
  smooth:     ["jazz", "rnb", "soul", "bossa", "lofi"],
  energetic:  ["house", "techno", "soca", "punk", "drum-and-bass"],
  sad:        ["lofi", "ballad", "rnb"],
  happy:      ["disco", "soca", "calypso", "pop", "house"],
  dreamy:     ["lofi", "ambient", "deepHouse"],
  groovy:     ["funk", "disco", "afrobeat", "house"],
  intense:    ["metal", "dnb", "techno", "drill"],
  romantic:   ["bossa", "ballad", "rnb", "jazz"],
};

// ─── Weight Constants ───
const W_GENRE  = 25;
const W_BPM    = 20;
const W_TIMESIG = 20;
const W_DENSITY = 15;
const W_SWING  = 10;
const W_MOOD   = 10;

function scoreGenre(pattern: StepGridPattern, features: ProgressionFeatures): number {
  const { genre, genreConfidence } = features;
  if (!genre) return 5; // no genre info, give small base score

  // Check exact tag match
  const tags = pattern.genreTags.map((t) => t.toLowerCase());
  if (tags.includes(genre)) return W_GENRE * genreConfidence;

  // Check affinity match
  const affinities = GENRE_AFFINITY[genre] || [];
  for (const tag of tags) {
    if (affinities.includes(tag)) return 15 * genreConfidence;
    // Check if any pattern tag has affinity to user's genre
    const tagAffinities = GENRE_AFFINITY[tag] || [];
    if (tagAffinities.includes(genre)) return 12 * genreConfidence;
  }

  return 2; // no match at all
}

function scoreBpm(pattern: StepGridPattern, features: ProgressionFeatures): number {
  const { bpm } = features;
  const [lo, hi] = pattern.bpmRange;

  if (bpm >= lo && bpm <= hi) return W_BPM;

  // Linear falloff: zero at 40 BPM distance from range
  const distance = bpm < lo ? lo - bpm : bpm - hi;
  const falloff = Math.max(0, 1 - distance / 40);
  return W_BPM * falloff;
}

function scoreTimeSig(pattern: StepGridPattern, features: ProgressionFeatures): number {
  const pTs = pattern.timeSignature;
  const fTs = features.timeSignature;
  if (pTs.numerator === fTs.numerator && pTs.denominator === fTs.denominator) return W_TIMESIG;
  return 0; // hard filter
}

function scoreDensity(pattern: StepGridPattern, features: ProgressionFeatures): number {
  const { rhythmicDensity } = features;
  if (rhythmicDensity === 0) return W_DENSITY * 0.7; // no melody data, neutral

  // Count active steps in pattern
  const trackIds = Object.keys(pattern.tracks) as (keyof typeof pattern.tracks)[];
  let activeSteps = 0;
  let totalSteps = 0;
  for (const id of trackIds) {
    const track = pattern.tracks[id];
    if (!track) continue;
    for (const step of track.steps) {
      totalSteps++;
      if (step.velocity > 0) activeSteps++;
    }
  }
  const patternDensity = totalSteps > 0 ? activeSteps / totalSteps : 0;

  // Complementary: dense melody prefers simpler drums, sparse melody allows dense drums
  const complementScore = 1 - Math.abs(rhythmicDensity - (1 - patternDensity));
  return W_DENSITY * complementScore;
}

function scoreSwing(pattern: StepGridPattern, features: ProgressionFeatures): number {
  const { swingAmount } = features;
  const wantsSwing = swingAmount > 30;

  if (wantsSwing && pattern.swingCapable) return W_SWING;
  if (!wantsSwing && !pattern.swingCapable) return W_SWING * 0.8;
  if (wantsSwing && !pattern.swingCapable) return W_SWING * 0.3;
  // !wantsSwing && swingCapable — still fine, just won't apply swing
  return W_SWING * 0.7;
}

function scoreMood(pattern: StepGridPattern, features: ProgressionFeatures): number {
  const { mood } = features;
  if (!mood) return W_MOOD * 0.5;

  const moodGenres = MOOD_GENRE_MAP[mood] || [];
  if (moodGenres.length === 0) return W_MOOD * 0.5;

  const tags = pattern.genreTags.map((t) => t.toLowerCase());
  for (const tag of tags) {
    if (moodGenres.includes(tag)) return W_MOOD;
    // Check tag affinities against mood genres
    const tagAffinities = GENRE_AFFINITY[tag] || [];
    for (const mg of moodGenres) {
      if (tagAffinities.includes(mg)) return W_MOOD * 0.7;
    }
  }

  return W_MOOD * 0.2;
}

function buildReasoning(pattern: StepGridPattern, breakdown: ScoreBreakdown, features: ProgressionFeatures): string {
  const parts: string[] = [];

  if (breakdown.genre >= 20) parts.push(`Strong ${features.genre} genre match`);
  else if (breakdown.genre >= 12) parts.push(`Related genre to ${features.genre}`);

  if (breakdown.bpm >= 18) parts.push(`BPM ${features.bpm} is within range`);
  else if (breakdown.bpm >= 10) parts.push(`BPM ${features.bpm} is close to range`);
  else if (breakdown.bpm > 0) parts.push(`BPM ${features.bpm} is outside ideal range`);

  if (breakdown.timeSig === 0) parts.push("Time signature mismatch");

  if (breakdown.mood >= 8) parts.push(`Fits ${features.mood} mood`);

  if (pattern.swingCapable && features.swingAmount > 30) parts.push("Swing-compatible");

  return parts.join(". ") || pattern.name;
}

/**
 * Scores all patterns against the extracted features.
 * Returns sorted array (highest score first).
 */
export function scorePatterns(
  patterns: StepGridPattern[],
  features: ProgressionFeatures,
): PatternScore[] {
  return patterns
    .map((pattern) => {
      const breakdown: ScoreBreakdown = {
        genre: scoreGenre(pattern, features),
        bpm: scoreBpm(pattern, features),
        timeSig: scoreTimeSig(pattern, features),
        density: scoreDensity(pattern, features),
        swing: scoreSwing(pattern, features),
        mood: scoreMood(pattern, features),
      };

      const score = Math.round(
        breakdown.genre + breakdown.bpm + breakdown.timeSig +
        breakdown.density + breakdown.swing + breakdown.mood,
      );

      const reasoning = buildReasoning(pattern, breakdown, features);

      return { pattern, score, reasoning, breakdown };
    })
    .sort((a, b) => b.score - a.score);
}
