import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server renders an inference-engineering learning playground", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>P99 — Learn inference engineering by running it\.<\/title>/i);
  assert.match(html, /Learn inference/);
  assert.match(html, /START WITH THE BASICS/);
  assert.match(html, /Free playground/i);
  assert.match(html, /Production incidents/i);
  assert.match(html, /Foundations/i);
  assert.match(html, /Tail latency/i);
  assert.match(html, /KV cache/i);
  assert.match(html, /Quantization/);
  assert.match(html, /PLAYGROUND → INCIDENTS/i);
  assert.doesNotMatch(html, /Learnscape|CartPole|pendulum|course page|Bring a physics page|api\/analyze/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});
