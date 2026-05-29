import { style, colorForValue, dotForValue, gradeBadge } from "./ansi";
import type { CompositeResult } from "../types/metrics";

const BAR_W = 16;

function bar(pct: number): string {
  const c = Math.max(0, Math.min(1, pct));
  const n = Math.round(c * BAR_W * 8);
  const f = Math.floor(n / 8);
  const p = n % 8;
  const blk = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];
  return "█".repeat(f) + (p > 0 ? blk[p] : "");
}

const L: Record<string, string> = {
  EPR: "产出/探索",
  FAA: "首次成功",
  CSI: "代码留存",
  TP: "定位精度",
  IC: "收敛速度",
  LPR: "Lint通过",
  CE: "改动耐久",
  DC: "决策一致",
};

const W = 68;
const GAP = "  ";

export function renderTable(
  _m: unknown,
  composite: CompositeResult,
  sessionId: string,
  iterations: number,
  toolCalls: number,
  filesChanged: number,
): string {
  const cv = composite.composite ?? 0;
  const cvStr =
    composite.composite !== null ? `${(cv * 100).toFixed(0)}%` : "--";
  const badge = composite.composite !== null ? gradeBadge(cv) : "";
  const cvColor = colorForValue(cv);
  const info = `${iterations}次迭代 · ${toolCalls}次调用 · ${filesChanged}个文件`;

  // Build metric rows — 2 columns
  const rows: string[] = [];
  for (let i = 0; i < composite.details.length; i += 2) {
    rows.push(metricRow(composite.details[i], composite.details[i + 1]));
  }

  return `
  ${style.bold("Agent-Eff")}  ${cvColor(style.bold(cvStr))} ${badge}
  ${style.dim(info)}

${rows.join("\n")}

  ${style.dim(`session ${sessionId.substring(0, 12)}`)}
`;
}

function metricRow(
  a: { name: string; value: number | null; weight: number },
  b?: { name: string; value: number | null; weight: number },
): string {
  return `  ${renderCard(a)}${GAP}${b ? renderCard(b) : ""}`;
}

function renderCard(d: { name: string; value: number | null }): string {
  const label = L[d.name] || d.name;
  if (d.value === null) {
    const na = style.dim("· N/A".padStart(BAR_W + 4));
    return `${style.dim("◌")} ${style.dim(label.padEnd(8))}  ${na}`;
  }
  const color = colorForValue(d.value);
  const dot = dotForValue(d.value);
  const b = bar(d.value).padEnd(BAR_W, " ");
  const pct = `${(d.value * 100).toFixed(0)}%`;
  return `${dot} ${style.bold(label.padEnd(8))} ${color(b)} ${color(pct.padStart(4))}`;
}
