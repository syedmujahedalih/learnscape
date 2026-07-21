import type { InferenceConfig } from "./experiment.ts";

export type MeasuredState = {
  queueDepth: number;
  activeRequests: number;
  vramGb: number;
  utilization: number;
  throughput: number;
  p95Ms: number;
};

export type TraceWorkload = {
  requestRate: number;
  promptTokens: number;
  outputTokens: number;
  demandTokensPerSecond: number;
};

export type BenchmarkFrame = MeasuredState & {
  elapsedSeconds: number;
  ttftMs?: number;
  powerWatts?: number;
};

export type BenchmarkTrace = {
  id: string;
  source: "modal_gpu" | "local_llama";
  hardware: { gpu: string; memoryGb: number };
  model: { repo: string; quantization: string };
  config: InferenceConfig;
  workload: TraceWorkload;
  frames: BenchmarkFrame[];
  summary: {
    status: "completed" | "failed";
    p95Ms: number;
    ttftMs: number;
    throughput: number;
    peakVramGb: number;
    costPerMillion?: number;
    totalRequests: number;
    error?: string;
  };
};

export type CloudBenchmarkStatus = {
  jobId: string;
  status: "queued" | "starting" | "running" | "completed" | "failed";
  gpu: "T4" | "L4" | "A10";
  estimatedMaxCostUsd: number;
  trace?: BenchmarkTrace;
  error?: string;
};
