import type { MetricResult, CompositeResult } from "../types/metrics";

export function renderTable(
  metrics: Record<string, MetricResult>,
  composite: CompositeResult,
  sessionId: string,
  iterations: number,
  toolCalls: number,
  filesChanged: number,
): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  Session: ${sessionId.substring(0, 8)}...`);
  lines.push(
    `  Iterations: ${iterations} | Tool calls: ${toolCalls} | Files changed: ${filesChanged}`,
  );
  lines.push("");

  // Table header
  const header = `  ${"Metric".padEnd(28)} ${"Score".padEnd(10)} ${"Weight".padEnd(10)} ${"Weighted".padEnd(10)}`;
  lines.push(header);
  lines.push("  " + "-".repeat(58));

  for (const detail of composite.details) {
    const name = padMetricName(detail.name);
    const score =
      detail.value !== null ? `${(detail.value * 100).toFixed(1)}%` : "N/A";
    const weight = `${(detail.weight * 100).toFixed(0)}%`;
    const weighted =
      detail.value !== null
        ? `${(detail.value * detail.weight * 100).toFixed(1)}%`
        : "-";
    const note = detail.note ? ` (${detail.note})` : "";

    lines.push(
      `  ${name.padEnd(27)} ${score.padEnd(9)} ${weight.padEnd(9)} ${weighted}`,
    );
    if (note) lines[lines.length - 1] += note;
  }

  lines.push("  " + "-".repeat(58));

  if (composite.composite !== null) {
    const pct = (composite.composite * 100).toFixed(1);
    lines.push(`  ${"COMPOSITE EFFICIENCY SCORE".padEnd(47)} ${pct}%`);
  } else {
    lines.push(`  No metrics available for composite score`);
  }

  lines.push("");
  return lines.join("\n");
}

function padMetricName(name: string): string {
  const display: Record<string, string> = {
    EPR: "Exploration-to-Production",
    FAA: "First-Attempt Accuracy",
    CSI: "Code Survivability Index",
    TP: "Target Precision",
    IC: "Iteration Convergence",
    LPR: "Lint Pass Rate",
    CE: "Change Endurance",
    DC: "Decision Consistency",
  };
  return display[name] || name;
}
