import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server renders the source-to-world Learnscape experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Learnscape — Predict what happens\. Discover why\.<\/title>/i);
  assert.match(html, /Turn a page/);
  assert.match(html, /The Pendulum Observatory/);
  assert.match(html, /Source → system/);
  assert.match(html, /Misconception → experiment/);
  assert.match(html, /Evidence → transfer/);
  assert.match(html, /Watch the transformation/);
  assert.match(html, /Acid–Base Titration/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});
