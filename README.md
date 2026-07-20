# P99

**The flight simulator for inference engineers.** P99 teaches LLM serving through realistic production incidents. Learners predict a failure mode, tune the serving stack, replay a workload, and diagnose the result.

## Flagship incident

The launch-day latency spiral puts an 8B model on a 24 GB A10G under a sudden traffic spike. The learner must satisfy five simultaneous constraints:

- p95 end-to-end latency ≤ 4 seconds
- throughput ≥ 230 tokens/second
- VRAM usage below 24 GB
- quality ≥ 95%
- cost ≤ $1.50 per million output tokens

They can intervene through weight precision, continuous batching, KV-cache allocation, concurrency, prefix caching, and speculative decoding. A deterministic system model forecasts the outcome before a trace engine grades the same configuration.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. No model, API key, or GPU is required for the current trace-driven incident.

## Scientific boundary

The current runtime is an educational performance model calibrated to internally consistent workload assumptions. It is not a benchmark of an actual A10G and must not be used for capacity planning. The next technical milestone is collecting traces from llama.cpp and vLLM, fitting a hardware-conditioned surrogate, and executing selected configurations through a local bridge.

See [`docs/architecture.md`](docs/architecture.md), [`docs/demo-script.md`](docs/demo-script.md), and [`docs/limitations.md`](docs/limitations.md).
