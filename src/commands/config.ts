import { readConfig } from "../storage/reader";
import {
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  DEFAULT_LLM_CONFIG,
} from "../types/config";

export async function configCommand(): Promise<void> {
  const cwd = process.cwd();
  const config = readConfig(cwd);

  if (!config) {
    console.log("No configuration found. Run 'agent-eff init' first.");
    console.log("\nDefault configuration:");
  } else {
    console.log("Current configuration (.agent-eff/config.json):");
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  console.log(
    JSON.stringify(
      {
        weights: DEFAULT_WEIGHTS,
        thresholds: DEFAULT_THRESHOLDS,
        llm: DEFAULT_LLM_CONFIG,
      },
      null,
      2,
    ),
  );
}
