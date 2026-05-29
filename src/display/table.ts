import { style, colorForValue, dotForValue, gradeBadge } from "./ansi";
import type { CompositeResult } from "../types/metrics";

const BAR_W = 8;

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

  const chips: string[] = [];
  for (const d of composite.details) {
    chips.push(chip(d.name, d.value));
  }

  // Arrange in 2 rows: first 4 metrics, last 4 metrics
  const top = chips.slice(0, 4).join("  ");
  const bot = chips.slice(4, 8).join("  ");

  return `${style.bold("Agent-Eff")} ${cvColor(style.bold(cvStr))} ${badge}  ${style.dim(`${iterations}iter ${toolCalls}call`)}
${top}
${bot}`;
}

function chip(name: string, val: number | null): string {
  const label = L[name] || name;
  if (val === null) {
    return `${style.dim(label + " ·")}`;
  }
  const color = colorForValue(val);
  const b = bar(val).padEnd(BAR_W, " ");
  const pct = `${(val * 100).toFixed(0)}%`;
  return `${dotForValue(val)}${style.bold(label)} ${color(b)}${color(pct)}`;
}
