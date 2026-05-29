export interface AgentEffConfig {
  weights: Record<string, number>;
  llm?: LLMConfig;
  thresholds: ThresholdConfig;
}

export interface LLMConfig {
  provider: "ollama";
  endpoint: string;
  model: string;
  timeout: number;
}

export interface ThresholdConfig {
  iteration_gap_ms: number;
  round_gap_ms: number;
  faa_overlap_threshold: number;
  ic_penalty_factor: number;
  ce_lookahead_iterations: number;
}

export const DEFAULT_WEIGHTS: Record<string, number> = {
  EPR: 0.2,
  FAA: 0.2,
  CSI: 0.15,
  TP: 0.1,
  IC: 0.1,
  LPR: 0.1,
  CE: 0.1,
  DC: 0.05,
};

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  iteration_gap_ms: 60_000,
  round_gap_ms: 30_000,
  faa_overlap_threshold: 0.5,
  ic_penalty_factor: 0.3,
  ce_lookahead_iterations: 5,
};

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: "ollama",
  endpoint: "http://localhost:11434",
  model: "qwen2.5-coder:7b",
  timeout: 30_000,
};
