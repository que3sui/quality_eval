import { readToolCalls, readSessions } from "../storage/reader";
import { detectIterations } from "../iteration/detector";
import { computeEPR } from "../metrics/epr";
import { computeFAA } from "../metrics/faa";
import { computeTP } from "../metrics/tp";
import { computeIC } from "../metrics/ic";
import { computeComposite } from "../metrics/composite";
import { renderTable } from "../display/table";
import type { ToolCallEvent } from "../types/events";

export async function analyzeCommand(options: {
  latest?: boolean;
  session?: string;
  all?: boolean;
  quality?: boolean;
  format?: string;
}): Promise<void> {
  const cwd = process.cwd();
  const allCalls = readToolCalls(cwd);
  const sessions = readSessions(cwd);

  if (allCalls.length === 0) {
    console.log("No tool call data found. Run 'agent-eff init' first.");
    return;
  }

  // Group tool calls by session
  const callsBySession = groupBySession(allCalls);

  let targetSessions: string[];
  if (options.session) {
    targetSessions = [options.session];
  } else if (options.latest || (!options.all && callsBySession.size > 0)) {
    const latest = [...callsBySession.keys()].pop()!;
    targetSessions = [latest];
  } else {
    targetSessions = [...callsBySession.keys()];
  }

  for (const sessionId of targetSessions) {
    const calls = callsBySession.get(sessionId) || [];
    const iterations = detectIterations(calls);

    // Collect all changed files across iterations
    const allChanged = new Set<string>();
    iterations.forEach((iter) =>
      iter.files_changed.forEach((f) => allChanged.add(f)),
    );

    // Compute metrics
    const metrics = {
      EPR: computeEPR(calls),
      FAA: computeFAA(iterations),
      TP: computeTP(calls),
      IC: computeIC(iterations),
    };

    const composite = computeComposite(metrics);

    if (options.format === "json") {
      console.log(
        JSON.stringify(
          {
            session_id: sessionId,
            iterations: iterations.length,
            tool_calls: calls.length,
            files_changed: allChanged.size,
            metrics,
            composite: {
              score: composite.composite,
              details: composite.details.map((d) => ({
                name: d.name,
                value: d.value,
                weight: d.weight,
                contribution: d.contribution,
              })),
            },
          },
          null,
          2,
        ),
      );
    } else {
      const output = renderTable(
        metrics,
        composite,
        sessionId,
        iterations.length,
        calls.length,
        allChanged.size,
      );
      console.log(output);
    }
  }
}

function groupBySession(calls: ToolCallEvent[]): Map<string, ToolCallEvent[]> {
  const map = new Map<string, ToolCallEvent[]>();
  for (const call of calls) {
    const existing = map.get(call.session_id) || [];
    existing.push(call);
    map.set(call.session_id, existing);
  }
  // Sort each session's calls by timestamp
  for (const [, sessionCalls] of map) {
    sessionCalls.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }
  return map;
}
