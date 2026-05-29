// Minimal ANSI escape code helpers — zero dependency

const ESC = "\x1b[";
const RESET = `${ESC}0m`;

function ansi(code: string, text: string): string {
  return `${ESC}${code}m${text}${RESET}`;
}

export const style = {
  bold: (s: string) => ansi("1", s),
  dim: (s: string) => ansi("2", s),

  green: (s: string) => ansi("38;5;78", s),
  yellow: (s: string) => ansi("38;5;221", s),
  red: (s: string) => ansi("38;5;210", s),

  greenHex: (s: string) => ansi("38;2;74;222;128", s), // #4ade80
  amberHex: (s: string) => ansi("38;2;251;191;36", s), // #fbbf24
  redHex: (s: string) => ansi("38;2;248;113;113", s), // #f87171
};

export function colorForValue(v: number): (s: string) => string {
  if (v >= 0.7) return style.greenHex;
  if (v >= 0.4) return style.amberHex;
  return style.redHex;
}

export function dotForValue(v: number): string {
  if (v >= 0.7) return style.greenHex("●");
  if (v >= 0.4) return style.amberHex("●");
  return style.redHex("●");
}

export function gradeBadge(v: number): string {
  if (v >= 0.75) return style.bold(style.greenHex("✦ 高效"));
  if (v >= 0.55) return style.bold(style.amberHex("◈ 正常"));
  return style.bold(style.redHex("◆ 低效"));
}
