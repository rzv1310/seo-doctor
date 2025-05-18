DROP INDEX "emailIdx";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "picture" TO "picture" text;--> statement-breakpoint
CREATE UNIQUE INDEX `emailIdx` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `users` ADD `password` text NOT NULL;