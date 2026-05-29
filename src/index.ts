#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("agent-eff")
  .description("Measure AI coding agent efficiency across project iterations")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize .agent-eff/ directory and hook configuration")
  .option("--write", "Auto-insert hooks into .claude/settings.json")
  .action(async (options) => {
    const { initCommand } = await import("./commands/init");
    await initCommand(options);
  });

program
  .command("record <subEvent>")
  .description("Record an event (called by Claude Code hooks via stdin)")
  .action(async (subEvent) => {
    const { recordCommand } = await import("./commands/record");
    await recordCommand(subEvent);
  });

program
  .command("analyze")
  .description("Compute and display efficiency scores")
  .option("--latest", "Analyze only the latest session")
  .option("--session <id>", "Analyze a specific session")
  .option("--all", "Analyze all sessions")
  .option("--quality", "Enable Tier 3 quality analysis (requires Ollama)")
  .option("--format <format>", "Output format: table or json", "table")
  .action(async (options) => {
    const { analyzeCommand } = await import("./commands/analyze");
    await analyzeCommand(options);
  });

program
  .command("checkpoint")
  .description("Auto-commit if enough time passed (called by PreToolUse hook)")
  .action(() => {
    const { checkpointCommand } = require("./commands/checkpoint");
    checkpointCommand();
  });

program
  .command("config")
  .description("View or modify configuration")
  .action(async () => {
    const { configCommand } = await import("./commands/config");
    await configCommand();
  });

program.parse(process.argv);
// test
