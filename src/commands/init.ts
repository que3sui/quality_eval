import * as fs from "fs";
import * as path from "path";
import { ensureDataDir, writeConfig } from "../storage/writer";
import {
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  DEFAULT_LLM_CONFIG,
} from "../types/config";

const HOOK_CONFIG_TEMPLATE = {
  PostToolUse: [
    {
      matcher: "Read|Write|Edit|Grep|Glob|Bash",
      hooks: [
        {
          type: "command",
          command: "agent-eff record post-tool",
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
          command: "agent-eff record session-stop",
          timeout: 10,
        },
      ],
    },
  ],
};

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
  hooks: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...existing };
  const existingHooks = (result.hooks as Record<string, unknown[]>) || {};

  for (const [hookPoint, configs] of Object.entries(hooks)) {
    const existingConfigs = existingHooks[hookPoint] || [];
    existingHooks[hookPoint] = [...existingConfigs, ...(configs as unknown[])];
  }

  result.hooks = existingHooks;
  return result;
}

export async function initCommand(options: { write?: boolean }): Promise<void> {
  const cwd = process.cwd();

  // Create .agent-eff/ directory structure
  ensureDataDir(cwd);
  writeConfig(cwd, {
    weights: DEFAULT_WEIGHTS,
    thresholds: DEFAULT_THRESHOLDS,
    llm: DEFAULT_LLM_CONFIG,
  });

  console.log("  Agent-Eff initialized!");
  console.log(`  Data directory: ${path.join(cwd, ".agent-eff")}`);

  if (options.write) {
    const settingsPath = findSettingsJson(cwd);
    if (settingsPath) {
      const existing = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      const merged = mergeHooksInto(existing, HOOK_CONFIG_TEMPLATE);
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
      fs.writeFileSync(
        newPath,
        JSON.stringify({ hooks: HOOK_CONFIG_TEMPLATE }, null, 2) + "\n",
        "utf-8",
      );
      console.log(`  Created: ${newPath}`);
    }
  } else {
    console.log("\n  Add this to your .claude/settings.json hooks section:\n");
    console.log(JSON.stringify(HOOK_CONFIG_TEMPLATE, null, 2));
  }
}
