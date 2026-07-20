"""Ephemeral llama.cpp GPU benchmark worker for P99.

Deploy with `modal deploy cloud/modal_benchmark.py`. The public ASGI endpoint only
accepts a small allow-listed benchmark surface and every worker has a hard timeout.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import subprocess
import time
import uuid
from pathlib import Path
from typing import Literal

import modal
from pydantic import BaseModel, Field


app = modal.App("p99-benchmark-worker")
jobs = modal.Dict.from_name("p99-benchmark-jobs", create_if_missing=True)
model_cache = modal.Volume.from_name("p99-model-cache", create_if_missing=True)
trace_store = modal.Volume.from_name("p99-benchmark-traces", create_if_missing=True)

image = (
    modal.Image.from_registry("nvidia/cuda:12.6.3-devel-ubuntu22.04", add_python="3.11")
    .apt_install("build-essential", "cmake", "curl", "git")
    .run_commands(
        "git clone --depth 1 https://github.com/ggml-org/llama.cpp /opt/llama.cpp",
        "cmake -S /opt/llama.cpp -B /opt/llama.cpp/build -DGGML_CUDA=ON -DLLAMA_CURL=ON -DCMAKE_BUILD_TYPE=Release",
        "cmake --build /opt/llama.cpp/build --config Release -j --target llama-server",
    )
    .pip_install("fastapi==0.116.1", "httpx==0.28.1", "pydantic==2.11.7")
)

GPU_MEMORY_GB = {"T4": 16, "L4": 24, "A10": 24}
MODAL_GPU = {"T4": "T4", "L4": "L4", "A10": "A10G"}
MAX_COST_USD = {"T4": 0.12, "L4": 0.16, "A10": 0.22}
QUANT = {"FP16": "F16", "INT8": "Q8_0", "INT4": "Q4_K_M"}
MODEL_REPO = "Qwen/Qwen2.5-7B-Instruct-GGUF"


class InferenceConfig(BaseModel):
    precision: Literal["FP16", "INT8", "INT4"]
    batchSize: Literal[1, 8, 16]
    cacheGb: Literal[6, 10, 14]
    concurrency: Literal[4, 12, 24]
    prefixCache: bool
    speculative: bool


class JobRequest(BaseModel):
    gpu: Literal["T4", "L4", "A10"] = "T4"
    config: InferenceConfig
    durationSeconds: int = Field(default=24, ge=12, le=45)


def metric(text: str, name: str) -> float:
    match = re.search(rf"^{re.escape(name)}(?:\{{[^\n]*\}})?\s+([0-9.eE+-]+)$", text, re.MULTILINE)
    return float(match.group(1)) if match else 0.0


def gpu_snapshot() -> tuple[float, float, float]:
    raw = subprocess.check_output(
        ["nvidia-smi", "--query-gpu=utilization.gpu,memory.used,power.draw", "--format=csv,noheader,nounits"],
        text=True,
    ).strip().split(",")
    return float(raw[0]), float(raw[1]) / 1024, float(raw[2])


async def wait_until_healthy(client, timeout_seconds: int = 240) -> None:
    started = time.monotonic()
    while time.monotonic() - started < timeout_seconds:
        try:
            response = await client.get("http://127.0.0.1:8080/health")
            if response.status_code == 200:
                return
        except Exception:
            pass
        await asyncio.sleep(1)
    raise TimeoutError("llama.cpp did not become healthy before the startup deadline")


async def collect_trace(payload: dict) -> dict:
    import httpx

    config = payload["config"]
    quant = QUANT[config["precision"]]
    ctx_size = {6: 4096, 10: 8192, 14: 12288}[config["cacheGb"]]
    batch_size = {1: 128, 8: 512, 16: 1024}[config["batchSize"]]
    command = [
        "/opt/llama.cpp/build/bin/llama-server",
        "-hf", f"{MODEL_REPO}:{quant}",
        "--host", "127.0.0.1", "--port", "8080", "--metrics",
        "--parallel", str(config["concurrency"]),
        "--ctx-size", str(ctx_size),
        "--batch-size", str(batch_size),
        "--ubatch-size", str(min(batch_size, 512)),
        "--n-gpu-layers", "all",
    ]
    if config["speculative"]:
        command.extend(["--spec-type", "ngram-simple"])

    server = subprocess.Popen(command, cwd="/models", stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    frames: list[dict] = []
    request_timings: list[dict] = []
    started = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=180) as client:
            await wait_until_healthy(client)
            benchmark_started = time.monotonic()

            async def sample() -> None:
                while time.monotonic() - benchmark_started < payload["durationSeconds"] + 3:
                    try:
                        metrics = (await client.get("http://127.0.0.1:8080/metrics")).text
                        utilization, vram_gb, power_watts = gpu_snapshot()
                        latencies = sorted(item["latencyMs"] for item in request_timings)
                        p95 = latencies[min(len(latencies) - 1, int(len(latencies) * .95))] if latencies else 0
                        frames.append({
                            "elapsedSeconds": round(time.monotonic() - benchmark_started, 2),
                            "queueDepth": round(metric(metrics, "llamacpp:requests_deferred")),
                            "activeRequests": round(metric(metrics, "llamacpp:requests_processing")),
                            "vramGb": round(vram_gb, 3),
                            "utilization": round(utilization),
                            "throughput": round(metric(metrics, "llamacpp:tokens_predicted_per_second"), 2),
                            "p95Ms": round(p95),
                            "powerWatts": round(power_watts, 1),
                        })
                    except Exception:
                        pass
                    await asyncio.sleep(1)

            shared_prefix = "You are an inference systems assistant. Analyze the production request carefully. " * 22
            unique_prompts = [f"{shared_prefix}\nRequest {index}: explain how batching and KV cache pressure interact." for index in range(48)]
            deadline = benchmark_started + payload["durationSeconds"]
            semaphore = asyncio.Semaphore(config["concurrency"])

            async def request(index: int) -> None:
                async with semaphore:
                    before = time.monotonic()
                    response = await client.post("http://127.0.0.1:8080/completion", json={
                        "prompt": unique_prompts[index % len(unique_prompts)],
                        "n_predict": 96,
                        "temperature": 0,
                        "cache_prompt": config["prefixCache"],
                    })
                    elapsed = (time.monotonic() - before) * 1000
                    response.raise_for_status()
                    timings = response.json().get("timings", {})
                    request_timings.append({
                        "latencyMs": elapsed,
                        "ttftMs": float(timings.get("prompt_ms", 0)) + float(timings.get("predicted_per_token_ms", 0)),
                        "tokens": int(timings.get("predicted_n", 96)),
                    })

            sampler = asyncio.create_task(sample())
            tasks = []
            index = 0
            interval = 1 / 2.4
            while time.monotonic() < deadline:
                tasks.append(asyncio.create_task(request(index)))
                index += 1
                await asyncio.sleep(interval)
            results = await asyncio.gather(*tasks, return_exceptions=True)
            await sampler
            failures = [result for result in results if isinstance(result, Exception)]
            if not request_timings:
                raise RuntimeError(str(failures[0]) if failures else "benchmark completed without successful requests")

        latencies = sorted(item["latencyMs"] for item in request_timings)
        ttfts = sorted(item["ttftMs"] for item in request_timings)
        p95_index = min(len(latencies) - 1, int(len(latencies) * .95))
        elapsed = max(.001, time.monotonic() - benchmark_started)
        gpu_hourly_usd = {"T4": 0.59, "L4": 0.80, "A10": 1.10}[payload["gpu"]]
        generated_tokens = sum(item["tokens"] for item in request_timings)
        return {
            "id": payload["jobId"], "source": "modal_gpu",
            "hardware": {"gpu": payload["gpu"], "memoryGb": GPU_MEMORY_GB[payload["gpu"]]},
            "model": {"repo": MODEL_REPO, "quantization": quant},
            "config": config,
            "workload": {"requestRate": 2.4, "promptTokens": 1200, "outputTokens": 96, "demandTokensPerSecond": 230.4},
            "frames": frames,
            "summary": {
                "status": "completed", "p95Ms": round(latencies[p95_index]),
                "ttftMs": round(ttfts[p95_index]),
                "throughput": round(generated_tokens / elapsed, 2),
                "peakVramGb": round(max(frame["vramGb"] for frame in frames), 2),
                "costPerMillion": round((gpu_hourly_usd * elapsed / 3600) / generated_tokens * 1_000_000, 2),
                "totalRequests": len(request_timings),
            },
        }
    finally:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()


@app.function(
    image=image,
    timeout=600,
    volumes={"/models": model_cache, "/traces": trace_store},
)
def benchmark_worker(job_id: str, payload: dict) -> None:
    jobs[job_id] = {**jobs[job_id], "status": "starting"}
    try:
        jobs[job_id] = {**jobs[job_id], "status": "running"}
        trace = asyncio.run(collect_trace({**payload, "jobId": job_id}))
        model_cache.commit()
        Path(f"/traces/{job_id}.json").write_text(json.dumps(trace, indent=2))
        trace_store.commit()
        jobs[job_id] = {**jobs[job_id], "status": "completed", "trace": trace}
    except Exception as error:
        jobs[job_id] = {**jobs[job_id], "status": "failed", "error": str(error)[:500]}


@app.function(image=image, secrets=[modal.Secret.from_name("p99-benchmark-secret")])
@modal.concurrent(max_inputs=50)
@modal.asgi_app()
def api():
    from fastapi import FastAPI, Header, HTTPException

    web = FastAPI(title="P99 benchmark runner")

    def authorize(key: str | None) -> None:
        expected = os.environ.get("P99_BENCHMARK_KEY")
        if not expected or key != expected:
            raise HTTPException(status_code=401, detail="invalid benchmark key")

    @web.get("/health")
    async def health():
        return {"ok": True, "model": MODEL_REPO, "gpus": list(GPU_MEMORY_GB)}

    @web.post("/jobs")
    async def create_job(request: JobRequest, x_p99_benchmark_key: str | None = Header(default=None)):
        authorize(x_p99_benchmark_key)
        job_id = uuid.uuid4().hex
        record = {"jobId": job_id, "status": "queued", "gpu": request.gpu, "estimatedMaxCostUsd": MAX_COST_USD[request.gpu]}
        jobs[job_id] = record
        benchmark_worker.with_options(gpu=MODAL_GPU[request.gpu]).spawn(job_id, request.model_dump())
        return record

    @web.get("/jobs/{job_id}")
    async def get_job(job_id: str, x_p99_benchmark_key: str | None = Header(default=None)):
        authorize(x_p99_benchmark_key)
        try:
            return jobs[job_id]
        except KeyError as error:
            raise HTTPException(status_code=404, detail="benchmark job not found") from error

    return web
