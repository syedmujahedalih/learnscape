import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the application exposes an inference-engineering learning playground", async () => {
  const html = `${await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8")}\n${await readFile(new URL("../app/page.tsx", import.meta.url), "utf8")}`;
  assert.match(html, /P99 — Learn the inference stack\. Measure what happens\./i);
  assert.match(html, /Learn the stack/);
  assert.match(html, /START WITH THE BASICS/);
  assert.match(html, /Experiment builder/i);
  assert.match(html, /Incident lab/i);
  assert.match(html, /Foundations/i);
  assert.match(html, /Follow one request/i);
  assert.match(html, /60-SECOND PRIMER/i);
  assert.match(html, /COMMIT TO A HYPOTHESIS/i);
  assert.match(html, /role="radiogroup"/i);
  assert.match(html, /role="switch"/i);
  assert.match(html, /This lab needs connected compute/i);
  assert.match(html, /Tail latency/i);
  assert.match(html, /KV cache/i);
  assert.match(html, /Quantization/);
  assert.match(html, /MEASURED RUNS ONLY/i);
  assert.match(html, /NO SYNTHETIC BENCHMARKS/i);
  assert.match(html, /Bring your own environment/i);
  assert.doesNotMatch(html, /simulateInference|forecastDynamics|reference trace|learned surrogate/i);
  assert.doesNotMatch(html, /CartPole|pendulum|course page|Bring a physics page|api\/analyze/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});
