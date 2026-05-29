import type { CompositeResult } from "../types/metrics";

const BAR_W = 8;

function bar(pct: number): string {
  const c = Math.max(0, Math.min(1, pct));
  const n = Math.round(c * BAR_W * 8);
  const f = Math.floor(n / 8);
  const p = n % 8;
  const blk = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];
  return "█".repeat(f) + (p > 0 ? blk[p] : "");
}

const EMOJI = { high: "🟢", mid: "🟡", low: "🔴", na: "⚪" };

function dot(val: number | null): string {
  if (val === null) return EMOJI.na;
  if (val >= 0.7) return EMOJI.high;
  if (val >= 0.4) return EMOJI.mid;
  return EMOJI.low;
}

function badge(val: number): string {
  if (val >= 0.75) return "高效";
  if (val >= 0.55) return "正常";
  return "低效";
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
  _sid: string,
  iterations: number,
  toolCalls: number,
  _fc: number,
): string {
  const cv = composite.composite ?? 0;
  const cvStr =
    composite.composite !== null ? `${(cv * 100).toFixed(0)}%` : "--";
  const bd = composite.composite !== null ? badge(cv) : "";

  const chips: string[] = [];
  for (const d of composite.details) {
    chips.push(chip(d.name, d.value));
  }

  return `\`Agent-Eff\`  **${cvStr}** ${dot(cv)} ${bd}  _${iterations}iter ${toolCalls}call_
${chips.slice(0, 4).join("  ")}
${chips.slice(4, 8).join("  ")}`;
}

function chip(name: string, val: number | null): string {
  const label = L[name] || name;
  if (val === null) {
    return `${EMOJI.na} _${label}_`;
  }
  const b = bar(val).padEnd(BAR_W, " ");
  const pct = `${(val * 100).toFixed(0)}%`;
  return `${dot(val)} **${label}** \`${b}\` ${pct}`;
}
