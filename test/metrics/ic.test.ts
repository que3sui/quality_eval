import { describe, it, expect } from "vitest";
import { computeIC } from "../../src/metrics/ic";
import type { Iteration } from "../../src/types/events";

function makeIter(roundCount: number): Iteration {
  const ts = new Date().toISOString();
  return {
    id: Math.random().toString(36).substring(2),
    session_id: "test",
    iteration_number: 1,
    start_timestamp: ts,
    end_timestamp: ts,
    tool_call_indices: [],
    files_changed: [],
    files_read: [],
    round_count: roundCount,
  };
}

describe("IC (Iteration Convergence)", () => {
  it("returns 100% for 1 round", () => {
    const result = computeIC([makeIter(1)]);
    expect(result.display).toBe("100.0%");
  });

  it("returns ~76.9% for 2 rounds", () => {
    const result = computeIC([makeIter(2)]);
    expect(parseFloat(result.display)).toBeCloseTo(76.9, 0);
  });

  it("returns decreasing values for more rounds", () => {
    const r1 = computeIC([makeIter(1)]);
    const r3 = computeIC([makeIter(3)]);
    const r5 = computeIC([makeIter(5)]);
    expect(parseFloat(r1.display)).toBeGreaterThan(parseFloat(r3.display));
    expect(parseFloat(r3.display)).toBeGreaterThan(parseFloat(r5.display));
  });
});
