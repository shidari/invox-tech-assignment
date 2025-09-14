CREATE TABLE `ai_analysis_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_path` text(255),
	`success` integer NOT NULL,
	`message` text(255),
	`class` integer,
	`confidence` real,
	`request_timestamp` text,
	`response_timestamp` text
);
--> statement-breakpoint
CREATE TABLE `class_label_embeddings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`embeddings` text NOT NULL,
	`label` text NOT NULL
);
