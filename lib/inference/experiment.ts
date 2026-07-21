export type Precision = "FP16" | "INT8" | "INT4";
export type BatchSize = 1 | 8 | 16;
export type CacheSize = 6 | 10 | 14;
export type Concurrency = 4 | 12 | 24;

export type InferenceConfig = {
  precision: Precision;
  batchSize: BatchSize;
  cacheGb: CacheSize;
  concurrency: Concurrency;
  prefixCache: boolean;
  speculative: boolean;
};

export const defaultExperimentConfig: InferenceConfig = {
  precision: "FP16",
  batchSize: 1,
  cacheGb: 6,
  concurrency: 12,
  prefixCache: false,
  speculative: false,
};

export const benchmarkWorkload = {
  model: "Qwen2.5 7B Instruct",
  requestRate: 2.4,
  promptTokens: 1200,
  outputTokens: 96,
  sharedPrefix: 67,
};
