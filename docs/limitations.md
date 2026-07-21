# Limitations

- P99 does not currently include a simulator or learned next-state model. Those capabilities were removed rather than presenting bootstrap behavior as a hardware predictor.
- Without an operator-configured runner, the hosted experience teaches concepts and creates experiment specs but cannot produce benchmark results.
- The included Modal path is one environment adapter, not a general bring-your-own-compute system.
- A browser cannot safely connect directly to a private localhost service. Local llama.cpp support requires an authenticated outbound bridge or local companion, which is future work.
- One short GPU run is not a statistically valid capacity benchmark. Real decisions require repeated trials, variance, warmup control, and workload-specific distributions.
- A performance trace does not measure model quality. Quality evaluation must run separately on representative tasks.
- The fixed workload does not yet cover full arrival distributions, preemption, tensor parallelism, network overhead, or multi-tenant interference.
- P99 currently contains six foundation concepts and one measured incident, not a complete inference-engineering curriculum.
