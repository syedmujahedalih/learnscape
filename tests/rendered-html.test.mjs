import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server renders one focused inference-engineering product", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>P99 — The inference systems lab\.<\/title>/i);
  assert.match(html, /Break the stack/);
  assert.match(html, /ENTER THE INCIDENT/);
  assert.match(html, /THE LAUNCH-DAY INCIDENT/);
  assert.match(html, /Quantization/);
  assert.match(html, /KV cache/i);
  assert.doesNotMatch(html, /Learnscape|CartPole|pendulum|course page|Bring a physics page|api\/analyze/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});
