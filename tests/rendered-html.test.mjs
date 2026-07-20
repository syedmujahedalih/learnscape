import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the application exposes an inference-engineering learning playground", async () => {
  const html = `${await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8")}\n${await readFile(new URL("../app/page.tsx", import.meta.url), "utf8")}`;
  assert.match(html, /P99 — Learn inference engineering by running it\./i);
  assert.match(html, /Learn inference/);
  assert.match(html, /START WITH THE BASICS/);
  assert.match(html, /Free playground/i);
  assert.match(html, /Production incidents/i);
  assert.match(html, /Foundations/i);
  assert.match(html, /Tail latency/i);
  assert.match(html, /KV cache/i);
  assert.match(html, /Quantization/);
  assert.match(html, /PLAYGROUND → INCIDENTS/i);
  assert.match(html, /PRIVACY-LIGHT ANALYTICS/i);
  assert.match(html, /30-day retention/i);
  assert.doesNotMatch(html, /Learnscape|CartPole|pendulum|course page|Bring a physics page|api\/analyze/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});
