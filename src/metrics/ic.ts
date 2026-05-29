import type { Iteration } from "../types/events";
import type { MetricResult } from "../types/metrics";

const IC_PENALTY_FACTOR = 0.3;

export function computeIC(iterations: Iteration[]): MetricResult {
  if (iterations.length === 0) {
    return {
      name: "IC",
      value: null,
      numerator: 0,
      denominator: 0,
      display: "N/A",
    };
  }

  let totalIC = 0;

  for (const iter of iterations) {
    const rounds = iter.round_count;
    const ic = 100 / (1 + (rounds - 1) * IC_PENALTY_FACTOR);
    totalIC += ic;
  }

  const avgIC = totalIC / iterations.length;
  return {
    name: "IC",
    value: avgIC / 100,
    numerator: Math.round(avgIC),
    denominator: 100,
    display: `${avgIC.toFixed(1)}%`,
  };
}
