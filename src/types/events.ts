export interface ToolCallEvent {
  event: "tool_call";
  session_id: string;
  tool_name: "Read" | "Write" | "Edit" | "Grep" | "Glob" | "Bash";
  timestamp: string;
  cwd: string;
  tool_input: Record<string, unknown>;
  tool_output?: Record<string, unknown>;
  is_error: boolean;
  duration_ms: number | null;
}

export interface SessionEvent {
  event: "session_start" | "session_stop";
  session_id: string;
  timestamp: string;
  cwd: string;
  git_branch?: string;
  git_commit?: string;
}

export interface Iteration {
  id: string;
  session_id: string;
  iteration_number: number;
  start_timestamp: string;
  end_timestamp: string;
  tool_call_indices: number[];
  files_changed: string[];
  files_read: string[];
  round_count: number;
}
