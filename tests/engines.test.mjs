import test from "node:test";
import assert from "node:assert/strict";
import { initialConfig, simulateInference } from "../lib/inference/engine.ts";
import { forecastWorld, worldModelInfo } from "../lib/inference/world-model.ts";

test("the launch configuration reproduces the latency incident", () => {
  const metrics = simulateInference(initialConfig);
  assert.equal(metrics.passed, false);
  assert.ok(metrics.p95Ms > 10_000);
  assert.ok(metrics.queueDepth > 100);
  assert.ok(metrics.throughput < 230);
  assert.match(metrics.bottleneck, /decode capacity/i);
});

test("an optimized serving stack contains the incident", () => {
  const metrics = simulateInference({ precision: "INT4", batchSize: 8, cacheGb: 10, concurrency: 12, prefixCache: true, speculative: true });
  assert.equal(metrics.passed, true);
  assert.equal(metrics.score, 100);
  assert.ok(metrics.p95Ms <= 4000);
  assert.ok(metrics.throughput >= 230);
  assert.ok(metrics.vramGb < 24);
  assert.ok(metrics.costPerMillion <= 1.5);
});

test("an oversized memory plan fails before execution", () => {
  const metrics = simulateInference({ ...initialConfig, cacheGb: 14, batchSize: 16 });
  assert.equal(metrics.oom, true);
  assert.equal(metrics.throughput, 0);
  assert.match(metrics.bottleneck, /VRAM/i);
});

test("the learned next-state model rolls a system state forward", () => {
  const rollout = forecastWorld(initialConfig);
  assert.equal(rollout.trajectory.length, 13);
  assert.ok(rollout.trajectory.at(-1).queueDepth > 100);
  assert.equal(rollout.metrics.passed, false);
  assert.ok(rollout.metrics.p95Ms > 10_000);
  assert.equal(worldModelInfo.parameters, 630);
  assert.equal(worldModelInfo.architecture, "19→24→6 next-state MLP");
});

test("the learned rollout recognizes the successful intervention", () => {
  const rollout = forecastWorld({ precision: "INT4", batchSize: 8, cacheGb: 10, concurrency: 12, prefixCache: true, speculative: true });
  assert.equal(rollout.metrics.passed, true);
  assert.ok(rollout.metrics.throughput >= 230);
  assert.ok(rollout.metrics.p95Ms <= 4000);
});
