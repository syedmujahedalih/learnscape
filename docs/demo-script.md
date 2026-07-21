# 90-second demo script

| Time | Screen | Narration |
|---|---|---|
| 0–12s | P99 landing page | “Inference engineering is usually taught through diagrams and disconnected benchmarks. P99 teaches the concepts, then makes you design the experiment.” |
| 12–28s | Open Foundations | “A beginner can start with tail latency, batching, KV cache, quantization, concurrency, or speculative decoding. Each lesson explains one change and the signals that would prove its effect.” |
| 28–45s | Open Experiment Builder | “I configure precision, batch size, cache, concurrency, prefix caching, and speculative decoding. P99 turns that into a reproducible experiment specification.” |
| 45–58s | Show `AWAITING RUNTIME` | “The important part is what P99 does not do. It does not invent a benchmark number. Until compute is connected, the result stays empty.” |
| 58–76s | Open Incident Lab and connected-runner setup | “With the optional runner attached, I commit to an outcome and execute the same controlled workload on a real GPU. The trace records latency, throughput, queue depth, utilization, power, and memory.” |
| 76–86s | Show current/future boundary | “The next step is bring your own environment, from local llama.cpp to cloud GPUs. A true learned world model comes later, trained and evaluated on diverse measured traces.” |
| 86–90s | End card | “P99 teaches inference engineering without pretending a toy simulator is production truth.” |

## Recording note

If a real runner is not warm and reliable, demonstrate the current environment boundary instead of showing fabricated results. A short pre-recorded GPU trace may be labeled as a captured measured run, with its provenance visible.

## One-line pitch

P99 helps learners understand inference systems by turning serving concepts into reproducible experiments on real compute.
