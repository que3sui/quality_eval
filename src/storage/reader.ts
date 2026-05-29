import * as fs from "fs";
import * as path from "path";
import { getDataDir } from "./writer";
import type { ToolCallEvent, SessionEvent } from "../types/events";

export function readJsonl<T>(projectRoot: string, filename: string): T[] {
  const dir = getDataDir(projectRoot);
  const filePath = path.join(dir, `${filename}.jsonl`);
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf-8").trim();
  if (!content) return [];

  return content.split("\n").map((line) => JSON.parse(line) as T);
}

export function readToolCalls(projectRoot: string): ToolCallEvent[] {
  return readJsonl<ToolCallEvent>(projectRoot, "tool_calls");
}

export function readSessions(projectRoot: string): SessionEvent[] {
  return readJsonl<SessionEvent>(projectRoot, "sessions");
}

export function readConfig(
  projectRoot: string,
): Record<string, unknown> | null {
  const configPath = path.join(projectRoot, ".agent-eff", "config.json");
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

export function dataExists(projectRoot: string): boolean {
  const dir = getDataDir(projectRoot);
  const tcPath = path.join(dir, "tool_calls.jsonl");
  return fs.existsSync(tcPath);
}
