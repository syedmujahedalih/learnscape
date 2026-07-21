# P99

**Learn the inference stack. Measure what happens.** P99 is a hands-on playground for people learning LLM inference engineering.

[Launch P99 →](https://learnscape-education.syedmujahedalih.chatgpt.site)

The hosted demo is public and works without an account or API key.

P99 is an OpenAI Build Week Education-track project. It turns tail latency, batching, KV cache, quantization, concurrency, and speculative decoding into a progression from concept to controlled experiment to measured runtime trace.

## What works today

- **Foundations:** six short lessons explain each serving concept, the variable to change, and the signals to observe.
- **Experiment builder:** learners configure a serving test and export a reproducible JSON specification.
- **Measured incident lab:** when an operator connects the optional runner, learners commit to an outcome and compare it with a real llama.cpp GPU trace.
- **Honest empty state:** without a connected runtime, P99 shows no simulated benchmark, synthetic score, or estimated result.
- **Optional cloud runner:** the included Modal worker can provision a T4, L4, or A10G, run an allow-listed Qwen2.5-7B GGUF workload, and return llama.cpp plus `nvidia-smi` telemetry.

Quality is deliberately not inferred from a performance trace. It requires a separate evaluation.

## Future direction

The next product step is **bring your own environment**: connect local llama.cpp, a workstation GPU, a lab cluster, or cloud compute through an authenticated trace adapter.

Once P99 has a broad corpus of measured transitions across hardware, models, workloads, and interventions, it can support a real learned next-state model. That model is future work. There is no neural predictor or hand-coded serving simulator in the current product.

## Run locally

```bash
npm install
npm run dev
```

The curriculum and experiment builder require no API key, model download, or GPU. To enable the included cloud runner, follow [docs/cloud-benchmarks.md](docs/cloud-benchmarks.md).

## Privacy-light telemetry

The public demo records only allow-listed interaction events, a one-way-hashed tab session identifier, coarse device class, and coarse referral source. It does not store names, email addresses, raw IPs, prompts, model outputs, or cross-site identifiers. Do Not Track is respected, raw events expire after 30 days, and aggregate metrics require an owner-held admin key.

## How Codex and GPT-5.6 were used

Codex was the primary engineering collaborator for the product pivot, interface implementation, cloud trace path, tests, documentation, and deployment. GPT-5.6 was used through Codex for core implementation and review decisions, not only copywriting.

Read [the architecture](docs/architecture.md), [demo script](docs/demo-script.md), and [limitations](docs/limitations.md).
