export interface TelemetryMetricInput {
  modelLatencyMs: number;
  thinkingTimeMs: number;
  outputTimeMs: number;
  tokensPerSecond: number;
  driftIndex: number;
  divergence: number;
  errorRate: number;
  retryCount: number;
  activeModels: string[];
  engine?: string;
  region?: string;
  timestamp?: number;
}

export interface AggregatedTelemetry {
  model: string;
  engine: string;
  region: string;
  timeBucket: string;
  latencyMs: number;
  thinkingTimeMs: number;
  outputTimeMs: number;
  tokensPerSecond: number;
  driftIndex: number;
  divergence: number;
  errorRate: number;
  retryCount: number;
  activeModels: string[];
}
