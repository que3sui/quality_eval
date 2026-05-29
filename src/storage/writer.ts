import * as fs from "fs";
import * as path from "path";

const DATA_DIR_NAME = ".agent-eff";
const DATA_SUBDIR = "data";

export function getDataDir(projectRoot: string): string {
  return path.join(projectRoot, DATA_DIR_NAME, DATA_SUBDIR);
}

export function ensureDataDir(projectRoot: string): string {
  const dir = getDataDir(projectRoot);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function jsonlAppend(
  projectRoot: string,
  filename: string,
  event: unknown,
): void {
  const dir = ensureDataDir(projectRoot);
  const filePath = path.join(dir, `${filename}.jsonl`);
  const line = JSON.stringify(event) + "\n";
  fs.appendFileSync(filePath, line, "utf-8");
}

export function writeConfig(projectRoot: string, config: unknown): void {
  const configDir = path.join(projectRoot, DATA_DIR_NAME);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, "config.json"),
    JSON.stringify(config, null, 2),
    "utf-8",
  );
}
