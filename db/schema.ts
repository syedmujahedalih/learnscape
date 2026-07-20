import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const telemetryEvents = sqliteTable("telemetry_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionHash: text("session_hash").notNull(),
  event: text("event").notNull(),
  source: text("source").notNull().default("direct"),
  device: text("device").notNull().default("desktop"),
  label: text("label"),
  value: text("value"),
  score: integer("score"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [
  index("telemetry_created_at_idx").on(table.createdAt),
  index("telemetry_event_idx").on(table.event),
  index("telemetry_session_idx").on(table.sessionHash),
]);
