import test from "node:test";
import assert from "node:assert/strict";
import { benchmarkWorkload, defaultExperimentConfig } from "../lib/inference/experiment.ts";

test("the default experiment is explicit and reproducible", () => {
  assert.deepEqual(defaultExperimentConfig, {
    precision: "FP16",
    batchSize: 1,
    cacheGb: 6,
    concurrency: 12,
    prefixCache: false,
    speculative: false,
  });
  assert.equal(benchmarkWorkload.model, "Qwen2.5 7B Instruct");
  assert.equal(benchmarkWorkload.promptTokens, 1200);
  assert.equal(benchmarkWorkload.outputTokens, 96);
});
