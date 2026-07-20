CREATE TABLE `telemetry_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_hash` text NOT NULL,
	`event` text NOT NULL,
	`source` text DEFAULT 'direct' NOT NULL,
	`device` text DEFAULT 'desktop' NOT NULL,
	`label` text,
	`value` text,
	`score` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `telemetry_created_at_idx` ON `telemetry_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `telemetry_event_idx` ON `telemetry_events` (`event`);--> statement-breakpoint
CREATE INDEX `telemetry_session_idx` ON `telemetry_events` (`session_hash`);