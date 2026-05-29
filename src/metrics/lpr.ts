import type { MetricResult } from "../types/metrics";
import type { ToolCallEvent } from "../types/events";

export function computeLPR(toolCalls: ToolCallEvent[]): MetricResult {
  const edits = toolCalls.filter(
    (tc) => tc.tool_name === "Write" || tc.tool_name === "Edit",
  );

  if (edits.length === 0) {
    return {
      name: "LPR",
      value: null,
      numerator: 0,
      denominator: 0,
      display: "N/A",
    };
  }

  const passed = edits.filter((tc) => !tc.is_error).length;
  const value = passed / edits.length;

  return {
    name: "LPR",
    value,
    numerator: passed,
    denominator: edits.length,
    display: `${(value * 100).toFixed(1)}%`,
  };
}
