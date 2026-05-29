import type { MetricResult } from "../types/metrics";
import type { Iteration } from "../types/events";

export function computeCE(iterations: Iteration[]): MetricResult {
  // CE requires git history for proper implementation.
  // This is a simplified version using file-overlap heuristics.
  if (iterations.length < 2) {
    return {
      name: "CE",
      value: null,
      numerator: 0,
      denominator: 0,
      display: "N/A",
    };
  }

  let totalFiles = 0;
  let enduringFiles = 0;

  const LOOKAHEAD = 3;

  for (let i = 0; i < iterations.length; i++) {
    const currentFiles = new Set(iterations[i].files_changed);
    if (currentFiles.size === 0) continue;

    // Check up to LOOKAHEAD iterations ahead
    const lookEnd = Math.min(i + LOOKAHEAD, iterations.length);
    let allRewritten = true;
    const rewrittenFiles = new Set<string>();

    for (let j = i + 1; j < lookEnd; j++) {
      const nextFiles = new Set(iterations[j].files_changed);
      for (const f of currentFiles) {
        if (nextFiles.has(f)) {
          rewrittenFiles.add(f);
        }
      }
    }

    // A file "endures" if it's NOT rewritten in the next LOOKAHEAD iterations
    for (const f of currentFiles) {
      totalFiles++;
      if (!rewrittenFiles.has(f)) {
        enduringFiles++;
      }
    }
  }

  if (totalFiles === 0) {
    return {
      name: "CE",
      value: null,
      numerator: 0,
      denominator: 0,
      display: "N/A",
    };
  }

  const value = enduringFiles / totalFiles;
  return {
    name: "CE",
    value,
    numerator: enduringFiles,
    denominator: totalFiles,
    display: `${(value * 100).toFixed(1)}%`,
  };
}
