# P99

**The flight simulator for inference engineers.** P99 teaches LLM serving through production incidents. Learners predict a failure mode, tune the stack, roll the system forward with a learned next-state model, and validate the forecast against either a reference trace or an ephemeral GPU benchmark.

## What is real today

- A 19→24→6 multilayer perceptron recursively predicts queue depth, active requests, VRAM, utilization, throughput, and p95 state.
- The checked-in weights are reproducibly trained from 10,800 bootstrap transitions so the demo works without a GPU.
- A deterministic reference engine independently grades configurations offline.
- An optional Modal runner provisions a T4, L4, or A10G; launches llama.cpp with Qwen2.5-7B; generates the fixed workload; and records llama.cpp plus `nvidia-smi` telemetry.
- The UI labels the provenance of every outcome. Bootstrap forecasts are never presented as measured production data.

## Flagship incident

The launch-day latency spiral puts an 8B-class model under a sudden traffic spike. The learner must satisfy p95 latency, throughput, VRAM, quality, and cost constraints by changing precision, continuous batching, KV-cache allocation, concurrency, prefix caching, and speculative decoding.

## Run locally

```bash
npm install
npm run dev
```

No API key, model download, or GPU is required for the learned forecast and reference-trace path. To enable real ephemeral GPU runs, follow [docs/cloud-benchmarks.md](docs/cloud-benchmarks.md).

## Retrain the world model

```bash
npm run world-model:train
```

The trainer consumes JSONL traces from `data/traces/` when at least 200 transitions are available; otherwise it regenerates the labeled bootstrap corpus. Generated weights live in `lib/inference/world-model-weights.ts`.

Read [the architecture](docs/architecture.md), [demo script](docs/demo-script.md), and [limitations](docs/limitations.md).
