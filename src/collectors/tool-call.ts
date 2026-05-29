import type { ToolCallEvent } from "../types/events";

const PRODUCTIVE_BASH_PATTERNS: RegExp[] = [
  /^(git\s+(add|commit|push|merge|rebase|cherry-pick))/,
  /^(npm|yarn|pnpm|bun)\s+(install|add|create|init|remove|update)/,
  /^(pip|pip3|conda)\s+install/,
  /^(cargo|go)\s+(install|build|add)/,
  /^(mkdir|touch|cp|mv|rm|chmod|chown)\s+/,
  /^(npx|npm)\s+create-/,
  /^(sed|awk)\s+.*-i/,
  /^echo\s+.*>\s*/,
  /^tee\s+/,
  /^(make|cmake|ninja)\s/,
];

const EXPLORATORY_BASH_PATTERNS: RegExp[] = [
  /^(ls|dir|find|locate)\s/,
  /^(cat|head|tail|less|more)\s/,
  /^(which|where|whereis|type)\s/,
  /^(wc|du|df|ps)\s/,
  /^(git\s+(log|diff|show|status|branch|remote|stash\s+list))/,
  /^(echo|printf|true|false)\b/,
  /^(set|export|env|printenv)\s/,
  /^(node|python|ruby)\s+-[ve]/,
  /^(curl|wget)\s+.*head/i,
];

export function isProductiveTool(toolName: string): boolean {
  if (toolName === "Write" || toolName === "Edit") return true;
  if (toolName === "Read" || toolName === "Grep" || toolName === "Glob")
    return false;
  return false;
}

export function isExploratoryTool(toolName: string): boolean {
  if (toolName === "Read" || toolName === "Grep" || toolName === "Glob")
    return true;
  return false;
}

export function classifyBashCommand(
  command: string,
): "productive" | "exploratory" {
  const trimmed = command.trim();
  for (const pattern of PRODUCTIVE_BASH_PATTERNS) {
    if (pattern.test(trimmed)) return "productive";
  }
  return "exploratory";
}

export function getFilePath(
  input: Record<string, unknown>,
  key: string,
): string | null {
  const val = input[key];
  if (typeof val === "string" && val.length > 0) return val;
  return null;
}

export function getBashCommand(input: Record<string, unknown>): string {
  const cmd = input.command;
  return typeof cmd === "string" ? cmd : "";
}

export function extractFilePaths(event: ToolCallEvent): {
  reads: string[];
  changes: string[];
} {
  const reads: string[] = [];
  const changes: string[] = [];

  switch (event.tool_name) {
    case "Read": {
      const fp = getFilePath(event.tool_input, "file_path");
      if (fp) reads.push(fp);
      break;
    }
    case "Write":
    case "Edit": {
      const fp = getFilePath(event.tool_input, "file_path");
      if (fp) changes.push(fp);
      break;
    }
    case "Grep": {
      const gp = getFilePath(event.tool_input, "path");
      if (gp) reads.push(gp);
      break;
    }
    case "Glob": {
      const glp =
        getFilePath(event.tool_input, "path") ||
        getFilePath(event.tool_input, "pattern");
      if (glp) reads.push(glp);
      break;
    }
    case "Bash":
      break;
  }

  return { reads, changes };
}
