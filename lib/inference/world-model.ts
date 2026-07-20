import { launchWorkload, simulateInference, type InferenceConfig, type InferenceMetrics } from "./engine.ts";
import type { WorldState } from "./trace.ts";
import { inferenceWorldModelWeights } from "./world-model-weights.ts";

const scales = [420, 24, 24, 100, 350, 20_000] as const;

const sigmoid = (value: number) => 1 / (1 + Math.exp(-Math.max(-18, Math.min(18, value))));
const normalizeState = (state: WorldState) => [state.queueDepth / scales[0], state.activeRequests / scales[1], state.vramGb / scales[2], state.utilization / scales[3], state.throughput / scales[4], state.p95Ms / scales[5]];
const denormalizeState = (values: number[]): WorldState => ({
  queueDepth: Math.max(0, values[0] * scales[0]),
  activeRequests: Math.max(0, values[1] * scales[1]),
  vramGb: Math.max(0, values[2] * scales[2]),
  utilization: Math.max(0, Math.min(100, values[3] * scales[3])),
  throughput: Math.max(0, values[4] * scales[4]),
  p95Ms: Math.max(0, values[5] * scales[5]),
});

function encode(config: InferenceConfig, state: WorldState, progress: number) {
  return [
    ...normalizeState(state),
    config.precision === "FP16" ? 1 : 0,
    config.precision === "INT8" ? 1 : 0,
    config.precision === "INT4" ? 1 : 0,
    config.batchSize / 16,
    config.cacheGb / 14,
    config.concurrency / 24,
    config.prefixCache ? 1 : 0,
    config.speculative ? 1 : 0,
    launchWorkload.requestRate / 4,
    launchWorkload.demandTokensPerSecond / 350,
    launchWorkload.promptTokens / 4000,
    launchWorkload.outputTokens / 256,
    progress,
  ];
}

function step(config: InferenceConfig, state: WorldState, progress: number) {
  const input = encode(config, state, progress);
  const hidden = inferenceWorldModelWeights.w1.map((weights, index) => Math.tanh(weights.reduce((sum, weight, inputIndex) => sum + weight * input[inputIndex], inferenceWorldModelWeights.b1[index])));
  const output = inferenceWorldModelWeights.w2.map((weights, index) => sigmoid(weights.reduce((sum, weight, hiddenIndex) => sum + weight * hidden[hiddenIndex], inferenceWorldModelWeights.b2[index])));
  return denormalizeState(output);
}

export function forecastWorld(config: InferenceConfig, horizon = 12): { metrics: InferenceMetrics; trajectory: WorldState[] } {
  const reference = simulateInference(config);
  let state: WorldState = { queueDepth: 2, activeRequests: 1, vramGb: Math.min(23.8, reference.vramGb * .82), utilization: 24, throughput: 18, p95Ms: 850 };
  const trajectory = [state];
  for (let index = 0; index < horizon; index++) {
    state = step(config, state, index / Math.max(1, horizon - 1));
    trajectory.push(state);
  }
  const oom = state.vramGb > 23.95 || reference.oom;
  const throughput = oom ? 0 : Math.round(state.throughput);
  const queueDepth = oom ? 420 : Math.round(state.queueDepth);
  // Tail latency includes queue residence time, which is not directly visible to
  // the token server head. The learned queue state therefore feeds this SLO head.
  const p95Ms = oom ? 0 : Math.round(Math.max(state.p95Ms, 850 + queueDepth * 35));
  const utilization = oom ? 0 : Math.round(state.utilization);
  const vramGb = Number((oom ? Math.max(24.1, state.vramGb) : state.vramGb).toFixed(1));
  const costPerMillion = throughput ? Number((1.2 * 1_000_000 / (throughput * 3600)).toFixed(2)) : 99;
  const checks = [!oom, p95Ms <= 4000, throughput >= 230, reference.quality >= 95, costPerMillion <= 1.5];
  const score = checks.filter(Boolean).length * 20;
  let bottleneck = "No active bottleneck. The deployment has SLO headroom.";
  if (oom) bottleneck = "The learned rollout predicts VRAM exhaustion during KV-cache growth.";
  else if (throughput < 230) bottleneck = "The learned rollout predicts token demand will outrun decode capacity.";
  else if (p95Ms > 4000) bottleneck = "The learned rollout predicts a tail-latency violation.";
  return {
    trajectory,
    metrics: {
      ...reference,
      ttftMs: Math.max(0, Math.round(p95Ms * .18)),
      p95Ms,
      throughput,
      vramGb,
      queueDepth,
      utilization,
      powerWatts: Math.round(64 + utilization * 1.65),
      costPerMillion,
      oom,
      score,
      passed: checks.every(Boolean),
      bottleneck,
    },
  };
}

export const worldModelInfo = inferenceWorldModelWeights.meta;
