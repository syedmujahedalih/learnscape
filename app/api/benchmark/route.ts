import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const configSchema = z.object({
  precision: z.enum(["FP16", "INT8", "INT4"]),
  batchSize: z.union([z.literal(1), z.literal(8), z.literal(16)]),
  cacheGb: z.union([z.literal(6), z.literal(10), z.literal(14)]),
  concurrency: z.union([z.literal(4), z.literal(12), z.literal(24)]),
  prefixCache: z.boolean(),
  speculative: z.boolean(),
});

const jobSchema = z.object({
  gpu: z.enum(["T4", "L4", "A10"]).default("T4"),
  config: configSchema,
  durationSeconds: z.number().int().min(12).max(45).default(24),
});

const endpoint = () => process.env.P99_BENCHMARK_URL?.replace(/\/$/, "");
const headers = () => ({ "content-type": "application/json", "x-p99-benchmark-key": process.env.P99_BENCHMARK_KEY ?? "" });

export async function GET(request: NextRequest) {
  const baseUrl = endpoint();
  const configured = Boolean(baseUrl && process.env.P99_BENCHMARK_KEY);
  const jobId = request.nextUrl.searchParams.get("job");
  if (!jobId) return NextResponse.json({ configured, provider: "Modal", model: "Qwen2.5-7B-Instruct-GGUF" });
  if (!configured) return NextResponse.json({ error: "Cloud GPU runner is not configured." }, { status: 503 });
  if (!/^[a-f0-9]{32}$/.test(jobId)) return NextResponse.json({ error: "Invalid benchmark job id." }, { status: 400 });
  try {
    const response = await fetch(`${baseUrl}/jobs/${jobId}`, { headers: headers(), cache: "no-store" });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "Cloud GPU runner is unreachable." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const baseUrl = endpoint();
  if (!baseUrl || !process.env.P99_BENCHMARK_KEY) {
    return NextResponse.json({ error: "No benchmark runner is connected. Follow docs/cloud-benchmarks.md to attach one." }, { status: 503 });
  }
  const parsed = jobSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid benchmark configuration.", issues: parsed.error.issues }, { status: 400 });
  try {
    const response = await fetch(`${baseUrl}/jobs`, { method: "POST", headers: headers(), body: JSON.stringify(parsed.data) });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "Cloud GPU runner is unreachable." }, { status: 502 });
  }
}
