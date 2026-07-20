import test from "node:test";
import assert from "node:assert/strict";
import { initialConfig, modelForecast, simulateInference } from "../lib/inference/engine.ts";

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

test("the system forecast remains close but not identical to the trace", () => {
  const config = { precision: "INT8", batchSize: 16, cacheGb: 10, concurrency: 12, prefixCache: true, speculative: true };
  const forecast = modelForecast(config);
  const observed = simulateInference(config);
  assert.notEqual(forecast.throughput, observed.throughput);
  assert.ok(Math.abs(forecast.throughput - observed.throughput) / observed.throughput < .05);
  assert.ok(Math.abs(forecast.p95Ms - observed.p95Ms) / observed.p95Ms < .05);
});
