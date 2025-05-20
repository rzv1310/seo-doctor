CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`picture` text,
	`billing_name` text,
	`billing_company` text,
	`billing_vat` text,
	`billing_address` text,
	`billing_phone` text,
	`stripe_customer_id` text,
	`admin` integer DEFAULT false
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emailIdx` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` real NOT NULL,
	`created_at` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`service_id` text NOT NULL,
	`created_at` text NOT NULL,
	`price` real NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`order_id` text,
	`created_at` text NOT NULL,
	`due_date` text NOT NULL,
	`amount` real NOT NULL,
	`status` text NOT NULL,
	`stripe_invoice_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`last_four` text NOT NULL,
	`expiry_month` integer,
	`expiry_year` integer,
	`is_default` integer DEFAULT false NOT NULL,
	`stripe_payment_method_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
