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

export type InferenceMetrics = {
  ttftMs: number;
  p95Ms: number;
  throughput: number;
  vramGb: number;
  queueDepth: number;
  quality: number;
  costPerMillion: number;
  utilization: number;
  powerWatts: number;
  oom: boolean;
  score: number;
  passed: boolean;
  bottleneck: string;
};

export const launchWorkload = {
  model: "8B INSTRUCT",
  accelerator: "A10G · 24 GB",
  requestRate: 2.4,
  promptTokens: 1200,
  outputTokens: 96,
  sharedPrefix: 67,
  demandTokensPerSecond: 230.4,
};

export const initialConfig: InferenceConfig = {
  precision: "FP16",
  batchSize: 1,
  cacheGb: 6,
  concurrency: 12,
  prefixCache: false,
  speculative: false,
};

const precisionProfile = {
  FP16: { weights: 15.8, quality: 100, decode: 82, prefill: 1 },
  INT8: { weights: 8.7, quality: 98, decode: 105, prefill: 1.08 },
  INT4: { weights: 5.2, quality: 95, decode: 142, prefill: 1.18 },
} as const;

const batchGain: Record<BatchSize, number> = { 1: 1, 8: 1.54, 16: 1.82 };
const concurrencyGain: Record<Concurrency, number> = { 4: .72, 12: .97, 24: 1 };

export function simulateInference(config: InferenceConfig): InferenceMetrics {
  const profile = precisionProfile[config.precision];
  const vramGb = profile.weights + config.cacheGb + 1.7 + config.batchSize * .08;
  const oom = vramGb > 24;
  const speculativeGain = config.speculative ? 1.29 : 1;
  const throughput = oom ? 0 : profile.decode * batchGain[config.batchSize] * concurrencyGain[config.concurrency] * speculativeGain;
  const load = throughput ? launchWorkload.demandTokensPerSecond / throughput : 9;
  const queueDepth = oom ? 420 : load <= .78 ? 2 : load <= 1 ? 2 + 55 * Math.pow((load - .78) / .22, 1.6) : 57 + 175 * (load - 1);
  const prefixGain = config.prefixCache ? .46 : 1;
  const queuePenalty = load <= .75 ? 0 : load <= 1 ? (load - .75) * 2500 : 1800 + (load - 1) * 4000;
  const ttftMs = oom ? 0 : 620 * profile.prefill * prefixGain + queuePenalty;
  const activeSequences = Math.min(config.concurrency, 4);
  const decodeLatency = oom ? 0 : launchWorkload.outputTokens / (profile.decode * speculativeGain / activeSequences) * 1000;
  const p95Ms = oom ? 0 : ttftMs + decodeLatency;
  const costPerMillion = oom || !throughput ? 99 : 1.2 * 1_000_000 / (throughput * 3600);
  const utilization = oom ? 0 : Math.min(99, Math.max(24, load * 100));
  const powerWatts = oom ? 42 : 64 + utilization * 1.65;
  const quality = profile.quality;

  const checks = [!oom, p95Ms <= 4000, throughput >= 230, quality >= 95, costPerMillion <= 1.5];
  const score = checks.filter(Boolean).length * 20;
  const passed = checks.every(Boolean);
  let bottleneck = "No active bottleneck. The deployment has SLO headroom.";
  if (oom) bottleneck = "VRAM exhausted before the runtime could allocate its KV cache.";
  else if (throughput < launchWorkload.demandTokensPerSecond) bottleneck = "Decode capacity is below incoming token demand, so the request queue compounds.";
  else if (p95Ms > 4000) bottleneck = "Per-request decode time is still violating the tail-latency budget.";
  else if (quality < 95) bottleneck = "Compression crossed the mission's quality floor.";
  else if (costPerMillion > 1.5) bottleneck = "The configuration meets performance targets but wastes accelerator capacity.";

  return {
    ttftMs: Math.round(ttftMs),
    p95Ms: Math.round(p95Ms),
    throughput: Math.round(throughput),
    vramGb: Number(vramGb.toFixed(1)),
    queueDepth: Math.round(queueDepth),
    quality,
    costPerMillion: Number(costPerMillion.toFixed(2)),
    utilization: Math.round(utilization),
    powerWatts: Math.round(powerWatts),
    oom,
    score,
    passed,
    bottleneck,
  };
}
