import { jsonlAppend, ensureDataDir, writeConfig } from "../storage/writer";
import { captureSessionState } from "../collectors/session-events";
import type { ToolCallEvent } from "../types/events";
import {
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  DEFAULT_LLM_CONFIG,
} from "../types/config";
import * as fs from "fs";
import * as path from "path";

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    if (process.stdin.isTTY) resolve("");
  });
}

export async function recordCommand(subEvent: string): Promise<void> {
  const cwd = process.cwd();
  const sessionId = process.env.CLAUDE_CODE_SESSION_ID || "unknown";

  if (subEvent === "post-tool") {
    const raw = await readStdin();
    if (!raw) return;

    let hookData: {
      tool_name?: string;
      tool_input?: Record<string, unknown>;
      tool_output?: Record<string, unknown>;
    };
    try {
      hookData = JSON.parse(raw);
    } catch {
      return;
    }

    const event: ToolCallEvent = {
      event: "tool_call",
      session_id: sessionId,
      tool_name: (hookData.tool_name as ToolCallEvent["tool_name"]) || "Bash",
      timestamp: new Date().toISOString(),
      cwd,
      tool_input: hookData.tool_input ?? {},
      tool_output: hookData.tool_output,
      is_error:
        (hookData.tool_output as Record<string, unknown>)?.is_error === true,
      duration_ms: null,
    };

    jsonlAppend(cwd, "tool_calls", event);
  } else if (subEvent === "session-stop") {
    const git = captureSessionState();
    const event = {
      event: "session_stop",
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      cwd,
      ...git,
    };
    jsonlAppend(cwd, "sessions", event);
  }
}
