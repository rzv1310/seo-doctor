CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`service_id` text NOT NULL,
	`status` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`trial_end_date` text,
	`renewal_date` text,
	`cancelled_at` text,
	`price` real NOT NULL,
	`usage` integer DEFAULT 0,
	`stripe_subscription_id` text,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action
);
