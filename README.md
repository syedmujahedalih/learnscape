# P99

**Learn inference engineering by running it.** P99 is an interactive playground for understanding LLM serving systems. Learners build the fundamentals through focused experiments, explore the serving stack freely, and graduate to production incidents powered by a learned next-state model.

[Launch the P99 playground →](https://learnscape-education.syedmujahedalih.chatgpt.site)

P99 is an OpenAI Build Week Education-track project built for students and engineers learning to operate production AI infrastructure. Instead of separating quantization, batching, caching, and decoding into passive lessons, it makes their interaction the curriculum.

## Learning experience

- **Foundations:** six beginner-friendly, one-variable labs covering tail latency, continuous batching, KV cache, quantization, concurrency, and speculative decoding.
- **Free playground:** every serving control updates a labeled 30-second learned rollout, queue trajectory, SLO readout, and plain-language causal explanation.
- **Production incidents:** learners predict a failure, combine multiple interventions, and validate the result against an independent trace.

The progression is deliberately simple: **learn → experiment → diagnose → operate**.

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

The trainer consumes JSON or JSONL traces from `data/traces/` when at least 200 transitions are available; otherwise it regenerates the labeled bootstrap corpus. Generated weights live in `lib/inference/world-model-weights.ts`.

## How Codex and GPT-5.6 were used

Codex was the primary engineering collaborator for the product pivot, inference-system architecture, learned state rollout, Modal/llama.cpp trace runner, UI implementation, tests, documentation, and deployment. GPT-5.6 was used through Codex for the core implementation and review decisions.

The judged experience remains deterministic and does not require API credits. This keeps the demo reliable while preserving an authenticated cloud path for measured GPU traces.

## Scientific boundary

The checked-in world model is a real recursive next-state network, currently trained on 10,800 bootstrap transitions generated from the reference dynamics. It is not presented as a production hardware predictor. The optional Modal runner is the data-collection path for replacing that corpus with repeated measurements.

Read [the architecture](docs/architecture.md), [demo script](docs/demo-script.md), and [limitations](docs/limitations.md).
