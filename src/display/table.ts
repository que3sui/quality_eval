import { style, colorForValue, dotForValue, gradeBadge } from "./ansi";
import type { CompositeResult } from "../types/metrics";

const BAR_W = 22;
const BLOCKS = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];

function bar(pct: number): string {
  const clamped = Math.max(0, Math.min(1, pct));
  const ticks = Math.round(clamped * BAR_W * 8);
  const full = Math.floor(ticks / 8);
  const part = ticks % 8;
  return "█".repeat(full) + (part > 0 ? BLOCKS[part] : "");
}

const LABELS: Record<string, string> = {
  EPR: "探索/生产比",
  FAA: "首次成功率",
  CSI: "代码留存",
  TP: "定位精度",
  IC: "收敛速度",
  LPR: "Lint通过率",
  CE: "改动耐久",
  DC: "决策一致性",
};

export function renderTable(
  _metrics: unknown,
  composite: CompositeResult,
  sessionId: string,
  iterations: number,
  toolCalls: number,
  filesChanged: number,
): string {
  const L: string[] = [];
  const cv = composite.composite ?? 0;
  const cvStr =
    composite.composite !== null ? `${(cv * 100).toFixed(1)}%` : "N/A";
  const badge = composite.composite !== null ? gradeBadge(cv) : "";

  // Header banner
  L.push("");
  L.push(`  ${style.bold("╭── Agent-Eff · 迭代效率评估 ")}${"─".repeat(32)}`);
  L.push(`  ${style.bold("│")}`);
  L.push(
    `  ${style.bold("│")}  复合分数  ${style.bold(colorForValue(cv)(cvStr))}  ${badge}`,
  );
  L.push(
    `  ${style.bold("│")}  ${style.dim(`Session ${sessionId.substring(0, 10)} · ${iterations}迭代 · ${toolCalls}次调用 · ${filesChanged}文件`)}`,
  );
  L.push(`  ${style.bold("╰")}${"─".repeat(58)}`);
  L.push("");

  // Metric rows with bars
  for (const d of composite.details) {
    const label = LABELS[d.name] || d.name;
    const w = `${(d.weight * 100).toFixed(0)}%`;

    if (d.value !== null) {
      const color = colorForValue(d.value);
      const dot = dotForValue(d.value);
      const b = bar(d.value);
      const pct = `${(d.value * 100).toFixed(1)}%`;
      const paddedBar = b.padEnd(BAR_W, " ");
      L.push(
        `  ${dot} ${style.bold(label.padEnd(10))} ${color(paddedBar)} ${color(pct.padStart(6))}  ${style.dim("w:" + w)}`,
      );
    } else {
      const placeholder = style.dim("· 无数据").padStart(BAR_W + 3);
      L.push(
        `  ${style.dim("◌")} ${style.dim(label.padEnd(10))} ${placeholder}          ${style.dim("w:" + w)}`,
      );
    }
  }

  L.push("");
  return L.join("\n");
}
