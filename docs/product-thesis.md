# Product thesis

Inference engineering is learned poorly through passive lectures because the important concepts are coupled tradeoffs. Batching can improve throughput while damaging tail latency. Quantization frees memory while changing quality. Context length and concurrency compete for KV cache. A single optimization can move the bottleneck elsewhere.

P99 turns those relationships into incidents with consequences. The learner must make a prediction, intervene under constraints, observe the system response, and diagnose the bottleneck.

The initial buyer is an instructor teaching ML systems, LLM systems, MLOps, or AI infrastructure. The early adopter is a technically capable learner who can use an API but has never operated an inference server under load.

The durable product advantage must become a library of trace-backed incidents and an instructor view of learner misconceptions—not generic infrastructure documentation.
