import * as fs from "fs";
import * as path from "path";
import { ensureDataDir, writeConfig } from "../storage/writer";
import {
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  DEFAULT_LLM_CONFIG,
} from "../types/config";

function resolveEntryScript(): string {
  // Resolve the compiled dist/index.js from this source file's location
  return path.resolve(__dirname, "..", "index.js");
}

function buildHookConfig(entryScript: string) {
  const cmd = pathToShellArg(entryScript);
  return {
    PostToolUse: [
      {
        matcher: "Read|Write|Edit|Grep|Glob|Bash",
        hooks: [
          {
            type: "command",
            command: `node ${cmd} record post-tool`,
            timeout: 5,
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command: `node ${cmd} record session-stop`,
            timeout: 10,
          },
        ],
      },
    ],
  };
}

function pathToShellArg(p: string): string {
  // Wrap in quotes and use forward slashes for cross-platform compatibility
  const normalized = p.replace(/\\/g, "/");
  // Escape double-quotes in path if any
  return `"${normalized.replace(/"/g, '\\"')}"`;
}

function findSettingsJson(cwd: string): string | null {
  // Check project-local first
  const localSettings = path.join(cwd, ".claude", "settings.json");
  if (fs.existsSync(localSettings)) return localSettings;

  const localSettingsLocal = path.join(cwd, ".claude", "settings.local.json");
  if (fs.existsSync(localSettingsLocal)) return localSettingsLocal;

  return null;
}

function mergeHooksInto(
  existing: Record<string, unknown>,
  newHookConfig: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...existing };
  const existingHooks = (result.hooks as Record<string, unknown[]>) || {};

  for (const [hookPoint, newEntries] of Object.entries(newHookConfig)) {
    const existingEntries = (existingHooks[hookPoint] || []) as Record<
      string,
      unknown
    >[];

    for (const newEntry of newEntries as Record<string, unknown>[]) {
      const newMatcher = newEntry.matcher as string | undefined;
      const newCommands = extractHookCommands(newEntry);

      // Check if an entry with the same matcher and commands already exists
      const isDuplicate = existingEntries.some((existing) => {
        if (newMatcher && existing.matcher !== newMatcher) return false;
        const existingCommands = extractHookCommands(existing);
        return newCommands.every((cmd) => existingCommands.includes(cmd));
      });

      if (!isDuplicate) {
        existingEntries.push(newEntry);
      }
    }

    existingHooks[hookPoint] = existingEntries;
  }

  result.hooks = existingHooks;
  return result;
}

function extractHookCommands(entry: Record<string, unknown>): string[] {
  const hooks = entry.hooks as Array<{ command?: string }> | undefined;
  if (!hooks) return [];
  return hooks.map((h) => h.command || "").filter(Boolean);
}

function generateSkillContent(entryScript: string): string {
  const cmd = pathToShellArg(entryScript);
  return `# Agent-Eff Skill

当用户输入 \`/eff\` 或询问"当前效率"、"效率分数"、"agent efficiency"时，执行以下操作：

## 步骤

1. 运行分析命令：
\`\`\`bash
node ${cmd} analyze --latest
\`\`\`

如果用户想看 JSON 格式的详细数据，加 \`--format json\`。

2. 将命令的表格输出直接展示在对话中。

3. 如果数据显示 EPR < 30% 或复合分数 < 50%，主动给出效率改进建议：
   - EPR 低 → 减少不必要的 Read/Grep，先想清楚再定位
   - FAA 低 → 说明在反复修改同样的文件，建议先通读相关代码再动手
   - TP 低 → 读了太多无关文件，建议缩小搜索范围
   - IC 低 → 任务被拆成了太多轮，建议一次给出完整方案

## 可选参数

- \`/eff all\` — 分析所有历史会话
- \`/eff json\` — 输出 JSON 格式
- \`/eff quality\` — 启用 Tier 3 质量分析（需要 Ollama）
`;
}

export async function initCommand(options: { write?: boolean }): Promise<void> {
  const cwd = process.cwd();
  const entryScript = resolveEntryScript();

  // Create .agent-eff/ directory structure
  ensureDataDir(cwd);
  writeConfig(cwd, {
    weights: DEFAULT_WEIGHTS,
    thresholds: DEFAULT_THRESHOLDS,
    llm: DEFAULT_LLM_CONFIG,
  });

  // Install skill file for /eff slash command
  const skillsDir = path.join(cwd, ".claude", "skills");
  fs.mkdirSync(skillsDir, { recursive: true });
  fs.writeFileSync(
    path.join(skillsDir, "agent-eff.md"),
    generateSkillContent(entryScript),
    "utf-8",
  );

  console.log("  Agent-Eff initialized!");
  console.log(`  Data directory: ${path.join(cwd, ".agent-eff")}`);
  console.log(
    `  Skill installed: type /eff in Claude Code to check efficiency`,
  );

  if (options.write) {
    const settingsPath = findSettingsJson(cwd);
    if (settingsPath) {
      const existing = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      const hookConfig = buildHookConfig(entryScript);
      const merged = mergeHooksInto(existing, hookConfig);
      fs.writeFileSync(
        settingsPath,
        JSON.stringify(merged, null, 2) + "\n",
        "utf-8",
      );
      console.log(`  Hooks written to: ${settingsPath}`);
    } else {
      // Create new settings.local.json
      const claudeDir = path.join(cwd, ".claude");
      fs.mkdirSync(claudeDir, { recursive: true });
      const newPath = path.join(claudeDir, "settings.local.json");
      const hookConfig = buildHookConfig(entryScript);
      fs.writeFileSync(
        newPath,
        JSON.stringify({ hooks: hookConfig }, null, 2) + "\n",
        "utf-8",
      );
      console.log(`  Created: ${newPath}`);
    }
  } else {
    console.log("\n  Add this to your .claude/settings.json hooks section:\n");
    console.log(JSON.stringify(buildHookConfig(entryScript), null, 2));
  }
}
