import type { ToolCallEvent, Iteration } from "../types/events";
import { extractFilePaths } from "../collectors/tool-call";

const ITERATION_GAP_MS = 60_000;
const ROUND_GAP_MS = 30_000;

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function detectIterations(toolCalls: ToolCallEvent[]): Iteration[] {
  if (toolCalls.length === 0) return [];

  const sorted = [...toolCalls].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const iterations: Iteration[] = [];
  let currentStart = 0;
  let currentRoundCount = 1;
  let lastTimestamp = new Date(sorted[0].timestamp).getTime();

  for (let i = 1; i < sorted.length; i++) {
    const ts = new Date(sorted[i].timestamp).getTime();
    const gap = ts - lastTimestamp;

    if (gap > ITERATION_GAP_MS) {
      iterations.push(
        buildIteration(
          sorted,
          currentStart,
          i - 1,
          iterations.length + 1,
          currentRoundCount,
        ),
      );
      currentStart = i;
      currentRoundCount = 1;
    } else if (gap > ROUND_GAP_MS) {
      currentRoundCount++;
    }
    lastTimestamp = ts;
  }

  // Final iteration
  iterations.push(
    buildIteration(
      sorted,
      currentStart,
      sorted.length - 1,
      iterations.length + 1,
      currentRoundCount,
    ),
  );

  return iterations;
}

function buildIteration(
  toolCalls: ToolCallEvent[],
  startIndex: number,
  endIndex: number,
  iterNumber: number,
  roundCount: number,
): Iteration {
  const calls = toolCalls.slice(startIndex, endIndex + 1);
  const filesRead = new Set<string>();
  const filesChanged = new Set<string>();

  for (const call of calls) {
    const { reads, changes } = extractFilePaths(call);
    reads.forEach((f) => filesRead.add(f));
    changes.forEach((f) => filesChanged.add(f));
  }

  return {
    id: generateId(),
    session_id: calls[0]?.session_id || "unknown",
    iteration_number: iterNumber,
    start_timestamp: calls[0].timestamp,
    end_timestamp: calls[calls.length - 1].timestamp,
    tool_call_indices: calls.map((_, i) => startIndex + i),
    files_changed: [...filesChanged],
    files_read: [...filesRead],
    round_count: roundCount,
  };
}

export function detectRoundsInIteration(toolCalls: ToolCallEvent[]): number {
  if (toolCalls.length <= 1) return 1;

  let rounds = 1;
  let lastTimestamp = new Date(toolCalls[0].timestamp).getTime();

  for (let i = 1; i < toolCalls.length; i++) {
    const ts = new Date(toolCalls[i].timestamp).getTime();
    if (ts - lastTimestamp > ROUND_GAP_MS) {
      rounds++;
    }
    lastTimestamp = ts;
  }

  return rounds;
}
