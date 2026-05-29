import { describe, it, expect } from "vitest";
import { computeTP } from "../../src/metrics/tp";
import type { ToolCallEvent } from "../../src/types/events";

function makeCall(
  tool_name: "Read" | "Write" | "Edit" | "Grep" | "Glob" | "Bash",
  ts: string,
  input: Record<string, unknown> = {},
): ToolCallEvent {
  return {
    event: "tool_call",
    session_id: "test",
    tool_name,
    timestamp: ts,
    cwd: "/test",
    tool_input: input,
    is_error: false,
    duration_ms: null,
  };
}

describe("TP (Target Precision)", () => {
  it("returns 100% when files changed equals files read", () => {
    const calls = [
      makeCall("Read", "2026-01-01T00:00:00Z", { file_path: "/test/a.ts" }),
      makeCall("Edit", "2026-01-01T00:00:01Z", { file_path: "/test/a.ts" }),
    ];
    const result = computeTP(calls);
    expect(result.value).toBe(1);
  });

  it("returns 50% when changed 1 file but read 2", () => {
    const calls = [
      makeCall("Read", "2026-01-01T00:00:00Z", { file_path: "/test/a.ts" }),
      makeCall("Read", "2026-01-01T00:00:01Z", { file_path: "/test/b.ts" }),
      makeCall("Edit", "2026-01-01T00:00:02Z", { file_path: "/test/a.ts" }),
    ];
    const result = computeTP(calls);
    expect(result.value).toBe(0.5);
  });

  it("returns 100% when no files read but files changed", () => {
    const calls = [
      makeCall("Write", "2026-01-01T00:00:00Z", { file_path: "/test/a.ts" }),
      makeCall("Write", "2026-01-01T00:00:01Z", { file_path: "/test/b.ts" }),
    ];
    const result = computeTP(calls);
    expect(result.value).toBe(1);
  });
});
