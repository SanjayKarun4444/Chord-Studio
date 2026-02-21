import type { Progression } from "../types";

export function validateCoherence(progression: Progression): string[] {
  const warnings: string[] = [];
  const { chords = [], drums, genre = "" } = progression;
  if (!drums) return warnings;

  let { kicks = [], snares = [], hihats = [], claps = [] } = drums;
  const g = genre.toLowerCase();

  // 1. Beat-0 kick — always anchor the bar
  const hasBeat0Kick = kicks.some((k) => k < 0.25);
  if (!hasBeat0Kick) {
    warnings.push("no-beat0-kick: injecting downbeat anchor");
    kicks = [0, ...kicks].sort((a, b) => a - b);
    drums.kicks = kicks;
  }

  // 2. Snare minimum — bare backbeat
  if (snares.length === 0) {
    warnings.push("no-snare: adding default backbeat");
    drums.snares = [1, 3];
  }

  // 3. Complexity overload — complex chords + dense hats = mud
  const complexChordCount = chords.filter((c) =>
    /maj9|m11|\b13\b|alt|#11|b9|#9|add9/.test(c),
  ).length;
  const hatDensity = hihats.length;

  if (complexChordCount >= 3 && hatDensity >= 14) {
    warnings.push(
      `complexity-overload: ${complexChordCount} complex chords + ${hatDensity} hats — thinning hats`,
    );
    drums.hihats = hihats.filter((_, i) => i % 2 === 0);
  }

  // 4. Genre hard rules

  // Reggaeton: dembow snare is non-negotiable
  if (g === "reggaeton") {
    const dembowBeats = [0.5, 1.5, 2.5, 3.5];
    const hasDembow = dembowBeats.every((b) =>
      snares.some((s) => Math.abs(s - b) < 0.15),
    );
    if (!hasDembow) {
      warnings.push("missing-dembow: correcting snare to canonical dembow pattern");
      drums.snares = [0.5, 1.5, 2.5, 3.5];
    }
    if (progression.swing > 10) {
      warnings.push("reggaeton-swing-correction: swing forced to 0");
      progression.swing = 0;
    }
    if (hihats.length < 14) {
      warnings.push("reggaeton-hats: filling to straight 16ths");
      drums.hihats = [
        0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25,
        3.5, 3.75,
      ];
    }
  }

  // House: four-on-floor kick is non-negotiable
  if (g === "house") {
    const floorBeats = [0, 1, 2, 3];
    const hasFourOnFloor = floorBeats.every((b) =>
      kicks.some((k) => Math.abs(k - b) < 0.15),
    );
    if (!hasFourOnFloor) {
      warnings.push("missing-four-on-floor: correcting kick");
      drums.kicks = [0, 1, 2, 3];
    }
    if (progression.swing > 15) {
      warnings.push("house-swing-correction: swing capped at 10");
      progression.swing = 10;
    }
  }

  // Drill: avoid kick on beat 3 (3.0 exactly)
  if (g === "drill") {
    const hasBeat3Kick = kicks.some((k) => Math.abs(k - 2.0) < 0.1);
    if (hasBeat3Kick) {
      warnings.push("drill-beat3-kick: removing kick from beat 3");
      drums.kicks = kicks.filter((k) => Math.abs(k - 2.0) >= 0.1);
    }
  }

  // 5. Empty claps — fill with genre default if expected
  const genresExpectingClaps = [
    "reggaeton", "house", "gospel", "rnb", "soul", "funk", "drill",
  ];
  if (genresExpectingClaps.includes(g) && claps.length === 0) {
    warnings.push(`${g}-claps: adding default clap pattern`);
    drums.claps = g === "reggaeton" ? [0.5, 2.5] : [1, 3];
  }

  return warnings;
}
