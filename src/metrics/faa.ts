import type { Iteration } from "../types/events";
import type { MetricResult } from "../types/metrics";

const FAA_OVERLAP_THRESHOLD = 0.5;

export function computeFAA(iterations: Iteration[]): MetricResult {
  if (iterations.length === 0) {
    return {
      name: "FAA",
      value: null,
      numerator: 0,
      denominator: 0,
      display: "N/A",
    };
  }

  if (iterations.length === 1) {
    return {
      name: "FAA",
      value: 1,
      numerator: 1,
      denominator: 1,
      display: "100.0%",
    };
  }

  let successes = 0;
  const total = iterations.length;

  for (let i = 0; i < total; i++) {
    if (i === total - 1) {
      // Last iteration: no follow-up to check, count as success
      successes++;
      continue;
    }

    const currentFiles = new Set(iterations[i].files_changed);
    const nextFiles = new Set(iterations[i + 1].files_changed);

    if (currentFiles.size === 0) {
      successes++;
      continue;
    }

    const intersection = new Set(
      [...currentFiles].filter((f) => nextFiles.has(f)),
    );
    const overlapRatio = intersection.size / currentFiles.size;

    if (overlapRatio < FAA_OVERLAP_THRESHOLD) {
      successes++;
    }
  }

  const value = successes / total;
  return {
    name: "FAA",
    value,
    numerator: successes,
    denominator: total,
    display: `${(value * 100).toFixed(1)}%`,
  };
}
