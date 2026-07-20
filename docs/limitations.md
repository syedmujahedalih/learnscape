# Limitations

- The current metrics are produced by an educational, internally consistent performance model—not measurements from an A10G.
- Quality is represented by a fixed quantization score rather than task-specific evaluation.
- The workload has fixed request lengths and does not yet model a full arrival distribution, preemption, failures, tensor parallelism, or network overhead.
- The browser cannot directly reach a private localhost inference server. Real execution requires a local agent or an authenticated HTTPS endpoint.
- P99 currently contains one incident. It is intentionally not a complete inference-engineering curriculum.
