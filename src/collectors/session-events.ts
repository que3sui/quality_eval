import { execSync } from "child_process";
import type { SessionEvent } from "../types/events";

export function captureSessionState(): {
  git_branch?: string;
  git_commit?: string;
} {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    const commit = execSync("git rev-parse HEAD", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    return { git_branch: branch, git_commit: commit };
  } catch {
    return {};
  }
}

export function buildSessionStart(
  sessionId: string,
  cwd: string,
): SessionEvent {
  const git = captureSessionState();
  return {
    event: "session_start",
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    cwd,
    ...git,
  };
}

export function buildSessionStop(sessionId: string, cwd: string): SessionEvent {
  const git = captureSessionState();
  return {
    event: "session_stop",
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    cwd,
    ...git,
  };
}
