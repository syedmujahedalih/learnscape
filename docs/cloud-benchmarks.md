# Enable real ephemeral GPU benchmarks

The core demo needs no cloud account. This optional path launches a single short-lived GPU and returns measured llama.cpp telemetry.

## 1. Authenticate Modal

```bash
python3 -m pip install modal
modal setup
```

## 2. Create the server-side secret

Generate a long random value, then store the same value in Modal and the P99 web environment:

```bash
modal secret create p99-benchmark-secret P99_BENCHMARK_KEY="YOUR_LONG_RANDOM_VALUE"
```

Never prefix this variable with `NEXT_PUBLIC_` and never paste it into browser settings.

## 3. Deploy the runner

```bash
modal deploy cloud/modal_benchmark.py
```

Modal prints the ASGI endpoint. Configure the P99 server:

```bash
P99_BENCHMARK_URL="https://YOUR-WORKSPACE--p99-benchmark-worker-api.modal.run"
P99_BENCHMARK_KEY="YOUR_LONG_RANDOM_VALUE"
```

Restart P99. `CLOUD GPU` should now say `ready · metered`.

## Spend and safety bounds

- Allowed accelerators: T4, L4, A10G.
- Browser-selected work duration: 12–45 seconds.
- Worker hard timeout: ten minutes, including model startup.
- Displayed worst-case caps: $0.12 T4, $0.16 L4, $0.22 A10G per job.
- Model repository, quantizations, request rate, generation length, and server binary are allow-listed in code.
- Every API request requires `P99_BENCHMARK_KEY`; the Next.js route is the only browser-facing proxy.

The first run can be slow because the container image and GGUF file are cold. Run one rehearsal before recording.

## Feed measured traces back into the model

Completed traces are stored in the Modal Volume named `p99-benchmark-traces`. Download the `.json` files into `data/traces/`, then run:

```bash
npm run dynamics:train
```

Once at least 200 measured transitions exist, the generated model metadata changes from `simulator_synthetic` to `cloud_and_local_traces`.
