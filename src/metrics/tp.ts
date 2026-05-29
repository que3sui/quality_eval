import type { ToolCallEvent } from "../types/events";
import { getFilePath } from "../collectors/tool-call";
import type { MetricResult } from "../types/metrics";

export function computeTP(toolCalls: ToolCallEvent[]): MetricResult {
  const filesRead = new Set<string>();
  const filesChanged = new Set<string>();

  for (const tc of toolCalls) {
    switch (tc.tool_name) {
      case "Read": {
        const fp = getFilePath(tc.tool_input, "file_path");
        if (fp) filesRead.add(fp);
        break;
      }
      case "Grep": {
        const gp = getFilePath(tc.tool_input, "path");
        if (gp) filesRead.add(gp);
        break;
      }
      case "Glob": {
        const gp = getFilePath(tc.tool_input, "path");
        if (gp) filesRead.add(gp);
        break;
      }
      case "Write":
      case "Edit": {
        const fp = getFilePath(tc.tool_input, "file_path");
        if (fp) filesChanged.add(fp);
        break;
      }
    }
  }

  if (filesRead.size === 0) {
    return {
      name: "TP",
      value: 1,
      numerator: filesChanged.size,
      denominator: 0,
      display: filesChanged.size > 0 ? "100.0%" : "N/A",
    };
  }

  const ratio = Math.min(1, filesChanged.size / filesRead.size);
  return {
    name: "TP",
    value: ratio,
    numerator: filesChanged.size,
    denominator: filesRead.size,
    display: `${(ratio * 100).toFixed(1)}%`,
  };
}
