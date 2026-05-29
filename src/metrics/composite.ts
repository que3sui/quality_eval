import type {
  MetricResult,
  MetricDetail,
  CompositeResult,
} from "../types/metrics";
import { DEFAULT_WEIGHTS } from "../types/config";

export function computeComposite(
  metrics: Record<string, MetricResult>,
  weights: Record<string, number> = DEFAULT_WEIGHTS,
): CompositeResult {
  let weightedSum = 0;
  let weightSum = 0;
  const details: MetricDetail[] = [];
  let availableCount = 0;

  for (const [name, weight] of Object.entries(weights)) {
    const metric = metrics[name];
    if (metric && metric.value !== null && metric.value !== undefined) {
      weightedSum += metric.value * weight;
      weightSum += weight;
      availableCount++;
      details.push({
        name,
        value: metric.value,
        weight,
        contribution: metric.value * weight,
      });
    } else {
      details.push({
        name,
        value: null,
        weight,
        contribution: 0,
        note: metric ? "N/A" : "not computed",
      });
    }
  }

  const composite = weightSum > 0 ? weightedSum / weightSum : null;

  return {
    composite,
    details,
    availableCount,
    totalCount: Object.keys(weights).length,
  };
}
