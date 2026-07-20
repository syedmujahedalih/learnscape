import { and, count, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { telemetryEvents } from "@/db/schema";

const eventNames = [
  "site_open",
  "foundations_open",
  "lesson_selected",
  "experiment_completed",
  "playground_open",
  "playground_control_changed",
  "playground_preset_loaded",
  "incident_started",
  "forecast_generated",
  "reference_trace_completed",
  "gpu_trace_completed",
  "incident_completed",
] as const;

const eventSchema = z.object({
  sessionId: z.string().min(16).max(80).regex(/^[a-zA-Z0-9-]+$/),
  event: z.enum(eventNames),
  source: z.enum(["direct", "linkedin", "x", "github", "other"]).default("direct"),
  device: z.enum(["mobile", "tablet", "desktop"]).default("desktop"),
  label: z.string().trim().max(48).optional(),
  value: z.string().trim().max(48).optional(),
  score: z.number().int().min(0).max(100).optional(),
}).strict();

const hashSession = async (sessionId: string) => {
  const bytes = new TextEncoder().encode(sessionId);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) throw new Error("origin mismatch");
    } catch {
      return Response.json({ error: "Cross-origin telemetry is not accepted." }, { status: 403 });
    }
  }

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid telemetry event." }, { status: 400 });

  try {
    const db = getDb();
    const sessionHash = await hashSession(parsed.data.sessionId);
    const [{ value: recentEvents }] = await db.select({ value: count() }).from(telemetryEvents).where(and(eq(telemetryEvents.sessionHash, sessionHash), sql`${telemetryEvents.createdAt} >= datetime('now', '-1 day')`));
    if (recentEvents >= 120) return new Response(null, { status: 202 });

    await db.insert(telemetryEvents).values({
      sessionHash,
      event: parsed.data.event,
      source: parsed.data.source,
      device: parsed.data.device,
      label: parsed.data.label,
      value: parsed.data.value,
      score: parsed.data.score,
    });
    await db.delete(telemetryEvents).where(sql`${telemetryEvents.createdAt} < datetime('now', '-30 days')`);
    return new Response(null, { status: 202 });
  } catch {
    // Analytics must never interrupt the learning experience.
    return new Response(null, { status: 202 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const [totals, recent, byEvent, bySource, byDevice] = await Promise.all([
      db.select({ sessions: sql<number>`count(distinct ${telemetryEvents.sessionHash})`, events: count() }).from(telemetryEvents),
      db.select({ sessions: sql<number>`count(distinct ${telemetryEvents.sessionHash})`, events: count() }).from(telemetryEvents).where(sql`${telemetryEvents.createdAt} >= datetime('now', '-1 day')`),
      db.select({ event: telemetryEvents.event, count: count() }).from(telemetryEvents).groupBy(telemetryEvents.event),
      db.select({ source: telemetryEvents.source, count: count() }).from(telemetryEvents).groupBy(telemetryEvents.source),
      db.select({ device: telemetryEvents.device, count: count() }).from(telemetryEvents).groupBy(telemetryEvents.device),
    ]);
    return Response.json({ retentionDays: 30, totals: totals[0], last24Hours: recent[0], byEvent, bySource, byDevice }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ retentionDays: 30, totals: { sessions: 0, events: 0 }, last24Hours: { sessions: 0, events: 0 }, byEvent: [], bySource: [], byDevice: [] }, { headers: { "cache-control": "no-store" } });
  }
}
