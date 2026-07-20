# Limitations

- The checked-in world-model weights are currently trained on 10,800 generated transitions from the reference dynamics, not real GPU traces. The UI calls this out as `BOOTSTRAP TRACE CORPUS`.
- A Modal run is measured, but one short run is not a statistically valid hardware benchmark. Use repeated trials and report variance for capacity planning.
- Quality is a fixed quantization score rather than task-specific evaluation.
- The benchmark workload uses fixed request lengths and arrival rate. It does not yet model a full arrival distribution, preemption, tensor parallelism, network overhead, or multi-tenant interference.
- The cloud worker uses an official 7B GGUF model as a practical proxy for the mission's 8B-class service.
- The browser never connects directly to localhost. Private local inference requires a separately authenticated outbound bridge, which is not included yet.
- P99 currently contains one incident, not a complete inference-engineering curriculum.
