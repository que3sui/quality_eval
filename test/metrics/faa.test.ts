import { describe, it, expect } from "vitest";
import { computeFAA } from "../../src/metrics/faa";
import type { Iteration } from "../../src/types/events";

function makeIter(filesChanged: string[], filesRead: string[] = []): Iteration {
  const ts = new Date().toISOString();
  return {
    id: Math.random().toString(36).substring(2),
    session_id: "test",
    iteration_number: 1,
    start_timestamp: ts,
    end_timestamp: ts,
    tool_call_indices: [],
    files_changed: filesChanged,
    files_read: filesRead,
    round_count: 1,
  };
}

describe("FAA (First-Attempt Accuracy)", () => {
  it("returns 100% for single iteration", () => {
    const result = computeFAA([makeIter(["file1.ts"])]);
    expect(result.value).toBe(1);
  });

  it("returns 100% when iterations modify different files", () => {
    const iters = [
      makeIter(["file1.ts"]),
      makeIter(["file2.ts"]),
      makeIter(["file3.ts"]),
    ];
    const result = computeFAA(iters);
    expect(result.value).toBe(1);
  });

  it("detects failure when next iteration touches same files", () => {
    const iters = [
      makeIter(["file1.ts", "file2.ts"]),
      makeIter(["file1.ts", "file3.ts"]), // overlap = file1.ts -> 1/2 = 50% overlap, NOT < 50%, so iter 0 fails
    ];
    const result = computeFAA(iters);
    // iter 0 fails (overlap not < 0.5), iter 1 is last -> counts as success
    expect(result.numerator).toBe(1);
    expect(result.denominator).toBe(2);
  });
});
