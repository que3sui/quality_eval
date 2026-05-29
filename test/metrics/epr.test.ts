import { describe, it, expect } from "vitest";
import { computeEPR } from "../../src/metrics/epr";
import type { ToolCallEvent } from "../../src/types/events";

function makeCall(
  tool_name: "Read" | "Write" | "Edit" | "Grep" | "Glob" | "Bash",
  ts: string,
  tool_input?: Record<string, unknown>,
): ToolCallEvent {
  return {
    event: "tool_call",
    session_id: "test",
    tool_name,
    timestamp: ts,
    cwd: "/test",
    tool_input: tool_input ?? {},
    is_error: false,
    duration_ms: null,
  };
}

describe("EPR (Exploration-to-Production Ratio)", () => {
  it("returns 100% for all productive calls", () => {
    const calls = [
      makeCall("Write", "2026-01-01T00:00:00Z"),
      makeCall("Edit", "2026-01-01T00:00:01Z"),
      makeCall("Write", "2026-01-01T00:00:02Z"),
    ];
    const result = computeEPR(calls);
    expect(result.value).toBe(1);
    expect(result.display).toBe("100.0%");
  });

  it("returns 0% for all exploratory calls", () => {
    const calls = [
      makeCall("Read", "2026-01-01T00:00:00Z"),
      makeCall("Grep", "2026-01-01T00:00:01Z"),
      makeCall("Glob", "2026-01-01T00:00:02Z"),
    ];
    const result = computeEPR(calls);
    expect(result.value).toBe(0);
    expect(result.display).toBe("0.0%");
  });

  it("returns 50% for equal productive and exploratory", () => {
    const calls = [
      makeCall("Write", "2026-01-01T00:00:00Z"),
      makeCall("Read", "2026-01-01T00:00:01Z"),
      makeCall("Edit", "2026-01-01T00:00:02Z"),
      makeCall("Grep", "2026-01-01T00:00:03Z"),
    ];
    const result = computeEPR(calls);
    expect(result.value).toBe(0.5);
    expect(result.display).toBe("50.0%");
  });

  it("classifies npm install bash as productive", () => {
    const calls = [
      makeCall("Write", "2026-01-01T00:00:00Z"),
      makeCall("Bash", "2026-01-01T00:00:01Z", {
        command: "npm install express",
      }),
    ];
    const result = computeEPR(calls);
    expect(result.value).toBe(1);
  });

  it("classifies ls/cat bash as exploratory", () => {
    const calls = [
      makeCall("Read", "2026-01-01T00:00:00Z"),
      makeCall("Bash", "2026-01-01T00:00:01Z", { command: "ls -la" }),
      makeCall("Bash", "2026-01-01T00:00:02Z", { command: "cat file.txt" }),
    ];
    const result = computeEPR(calls);
    expect(result.value).toBe(0);
  });
});
