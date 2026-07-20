# P99 architecture

P99 separates the learner-facing system model from the authoritative trace replay.

1. A fixed workload describes arrival rate, prompt and output length, prefix reuse, model size, and accelerator memory.
2. The learner configures precision, batching, KV-cache budget, concurrency, prefix caching, and speculative decoding.
3. The system model forecasts TTFT, p95 latency, throughput, VRAM, queue depth, quality, cost, utilization, and power.
4. The learner commits to a predicted failure mode.
5. The trace engine evaluates the same configuration and returns a deliberately small forecast error.
6. Five simultaneous SLO constraints produce the mission score and bottleneck diagnosis.

`lib/inference/engine.ts` contains both models so the prototype is deterministic, replayable, browser-native, and safe to demo without a GPU. This is an inference-systems simulator, not currently a learned world model.

## Next technical milestone

Replace the analytic forecast with a learned surrogate trained on benchmark traces shaped as:

`hardware + model + workload + serving configuration → latency + throughput + memory + failures`

A local agent can connect llama.cpp or vLLM to the deployed UI through an outbound authenticated channel. The trace executor remains authoritative; the learned surrogate must expose prediction error rather than grade itself.
