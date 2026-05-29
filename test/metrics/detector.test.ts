import { describe, it, expect } from "vitest";
import { detectIterations } from "../../src/iteration/detector";
import type { ToolCallEvent } from "../../src/types/events";

function makeCall(
  tool_name: "Read" | "Write" | "Edit" | "Grep" | "Glob" | "Bash",
  ts: Date,
): ToolCallEvent {
  return {
    event: "tool_call",
    session_id: "test",
    tool_name,
    timestamp: ts.toISOString(),
    cwd: "/test",
    tool_input: {},
    is_error: false,
    duration_ms: null,
  };
}

describe("Iteration Detector", () => {
  it("returns single iteration for quick consecutive calls", () => {
    const base = new Date("2026-01-01T00:00:00Z");
    const calls = [
      makeCall("Read", new Date(base.getTime() + 0)),
      makeCall("Edit", new Date(base.getTime() + 5000)),
      makeCall("Write", new Date(base.getTime() + 10000)),
    ];
    const iterations = detectIterations(calls);
    expect(iterations.length).toBe(1);
  });

  it("splits into multiple iterations on large gaps", () => {
    const base = new Date("2026-01-01T00:00:00Z");
    const calls = [
      makeCall("Read", new Date(base.getTime() + 0)),
      makeCall("Edit", new Date(base.getTime() + 5000)),
      // 90 second gap (> 60s default threshold)
      makeCall("Read", new Date(base.getTime() + 95000)),
      makeCall("Edit", new Date(base.getTime() + 100000)),
    ];
    const iterations = detectIterations(calls);
    expect(iterations.length).toBe(2);
  });
});
