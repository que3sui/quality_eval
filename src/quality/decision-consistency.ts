import type { MetricResult } from "../types/metrics";
import type { OllamaService } from "./ollama";
import { evaluatePatternReuse } from "./pattern-reuse";
import { evaluateRequirementFit } from "./requirement-fit";
import { evaluateFailureLearning } from "./failure-learning";

interface DCInput {
  projectPatterns: string;
  userPrompt: string;
  changesSummary: string;
  currentDiff: string;
  historicalFailures: string[];
}

export async function computeDC(
  ollama: OllamaService,
  input: DCInput,
): Promise<MetricResult> {
  const [patternResult, requirementResult, failureResult] = await Promise.all([
    evaluatePatternReuse(ollama, {
      project_patterns: input.projectPatterns,
      new_diff: input.currentDiff,
    }),
    evaluateRequirementFit(ollama, {
      user_prompt: input.userPrompt,
      changes_summary: input.changesSummary,
    }),
    evaluateFailureLearning(ollama, {
      historical_failures: input.historicalFailures,
      current_diff: input.currentDiff,
    }),
  ]);

  // DC = 0.4 * patternReuse + 0.3 * requirementFit + 0.3 * (100 - failureRisk)
  const dc =
    0.4 * patternResult.reuse_score +
    0.3 * requirementResult.completeness_score +
    0.3 * (100 - failureResult.risk_score);

  return {
    name: "DC",
    value: dc / 100,
    numerator: Math.round(dc),
    denominator: 100,
    display: `${dc.toFixed(1)}%`,
  };
}
