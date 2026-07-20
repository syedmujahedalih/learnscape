# 90-second demo script

| Time | Screen | Narration |
|---|---|---|
| 0–10s | P99 landing page | “Inference engineering is usually taught through diagrams. P99 teaches it through incidents.” |
| 10–22s | Enter Mission 01 | “Launch traffic jumped six times. This 8B-class service is missing its p95 SLO and losing money.” |
| 22–35s | Show constraints and topology | “I have to protect latency, throughput, VRAM, quality, and cost at the same time.” |
| 35–47s | Predict `Latency fails`; roll out baseline | “I commit to a failure mode. A learned next-state model rolls queue, GPU, memory, and latency forward—not just one final number.” |
| 47–63s | Select INT4, batch 8, 10 GB cache, concurrency 12, prefix cache, speculative decoding | “I quantize, batch, reuse the shared prefix, and draft tokens speculatively. Every intervention changes the system dynamics.” |
| 63–75s | Predict `Queue clears`; roll out | “The model predicts the queue will drain while quality stays above the floor.” |
| 75–84s | Replay reference trace | “Now an independent trace grades that forecast. For a live extended demo, the same button can provision a real GPU and capture llama.cpp telemetry.” |
| 84–90s | Successful verdict | “P99 is the flight simulator for inference engineers: break the stack, understand why, and fix it under pressure.” |

## Recording note

Use `REFERENCE TRACE` for the primary 90-second recording: it is instant and deterministic. Record a separate short insert of `CLOUD GPU` only after pre-warming the Modal image and model cache. Never make a cold container build part of the judged path.

## One-line pitch

P99 trains inference engineers through production incidents where every optimization changes latency, throughput, memory, quality, and cost.
