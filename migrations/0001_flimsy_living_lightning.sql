CREATE TABLE `password_resets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	`used_at` text
);
--> statement-breakpoint
CREATE INDEX `tokenIdx` ON `password_resets` (`token`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `password_resets` (`user_id`);