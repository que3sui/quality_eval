import type { ToolCallEvent } from "../types/events";
import { classifyBashCommand, getBashCommand } from "../collectors/tool-call";
import type { MetricResult } from "../types/metrics";

export function computeEPR(toolCalls: ToolCallEvent[]): MetricResult {
  const relevant = toolCalls.filter((tc) =>
    ["Read", "Write", "Edit", "Grep", "Glob", "Bash"].includes(tc.tool_name),
  );

  let productive = 0;
  let exploratory = 0;

  for (const tc of relevant) {
    if (tc.tool_name === "Write" || tc.tool_name === "Edit") {
      productive++;
    } else if (
      tc.tool_name === "Read" ||
      tc.tool_name === "Grep" ||
      tc.tool_name === "Glob"
    ) {
      exploratory++;
    } else if (tc.tool_name === "Bash") {
      const cmd = getBashCommand(tc.tool_input);
      if (classifyBashCommand(cmd) === "productive") {
        productive++;
      } else {
        exploratory++;
      }
    }
  }

  const total = productive + exploratory;
  if (total === 0) {
    return {
      name: "EPR",
      value: null,
      numerator: 0,
      denominator: 0,
      display: "N/A",
    };
  }

  const value = productive / total;
  return {
    name: "EPR",
    value,
    numerator: productive,
    denominator: total,
    display: `${(value * 100).toFixed(1)}%`,
  };
}
