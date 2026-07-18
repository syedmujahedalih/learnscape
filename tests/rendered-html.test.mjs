import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("api-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

test("server renders one coherent flagship Learnscape experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Learnscape — Turn a page into a lesson\.<\/title>/i);
  assert.match(html, /Turn a page/);
  assert.match(html, /Try the pendulum lesson/);
  assert.match(html, /Start with their belief/);
  assert.match(html, /Choose the useful test/);
  assert.match(html, /Finish with transfer/);
  assert.match(html, /Four systems/);
  assert.doesNotMatch(html, /ONE CONCEPT\. ONE QUESTION\. ONE USEFUL EXPERIMENT\.|One validated flagship/i);
  assert.doesNotMatch(html, /Acid–Base Titration|Ohm’s Law Circuit Lab|Outliers &amp; Center/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("page images never receive a fake analysis when GPT is unavailable", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "gpt", image: "data:image/png;base64,aGVsbG8=" }),
  }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.match(body.error, /OpenAI API key/i);
  assert.equal("blueprint" in body, false);
});
