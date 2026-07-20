# 90-second demo script

| Time | Screen | Narration |
|---|---|---|
| 0–10s | P99 landing page | “Inference engineering is usually taught through diagrams. P99 teaches it through incidents.” |
| 10–20s | Enter Mission 01 | “Launch traffic just jumped six times. This 8B deployment is missing its latency SLO and losing money.” |
| 20–34s | Show constraints and topology | “I have to protect latency, throughput, VRAM, quality, and cost at the same time.” |
| 34–48s | Commit prediction; simulate baseline | “The system model predicts decode saturation. The queue keeps compounding because incoming token demand exceeds capacity.” |
| 48–63s | Select INT4, batch 8, 10 GB cache, concurrency 12, prefix cache, speculative decoding | “I quantize carefully, introduce continuous batching, reuse the shared prefix, and draft tokens speculatively.” |
| 63–76s | Simulate and run replay | “P99 forecasts the outcome first. Then the trace engine grades the configuration instead of letting the model grade itself.” |
| 76–86s | Successful metrics | “The queue drains, p95 falls below four seconds, quality stays at 95%, and cost drops under budget.” |
| 86–90s | Verdict | “P99 is the flight simulator for inference engineers: break the stack, understand why, and fix it under pressure.” |

## One-line pitch

P99 trains inference engineers through production incidents where every optimization changes latency, throughput, memory, quality, and cost.
