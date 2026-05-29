export interface MetricResult {
  name: string;
  value: number | null;
  numerator: number;
  denominator: number;
  display: string;
}

export interface CompositeResult {
  composite: number | null;
  details: MetricDetail[];
  availableCount: number;
  totalCount: number;
}

export interface MetricDetail {
  name: string;
  value: number | null;
  weight: number;
  contribution: number;
  note?: string;
}

export interface SessionAnalysis {
  session_id: string;
  iterations: number;
  tool_calls: number;
  files_changed: number;
  metrics: Record<string, MetricResult>;
  composite: CompositeResult;
  trend_indicator: string;
}
