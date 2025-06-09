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
	`billing_registration_number` text,
	`billing_address` text,
	`billing_phone` text,
	`stripe_customer_id` text,
	`default_payment_method_id` text,
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
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription_id` text,
	`stripe_invoice_id` text NOT NULL,
	`stripe_customer_id` text NOT NULL,
	`number` text,
	`status` text NOT NULL,
	`currency` text DEFAULT 'RON' NOT NULL,
	`amount_total` integer NOT NULL,
	`amount_paid` integer DEFAULT 0 NOT NULL,
	`amount_remaining` integer DEFAULT 0 NOT NULL,
	`service_name` text,
	`service_id` text,
	`billing_name` text,
	`billing_company` text,
	`billing_vat` text,
	`billing_address` text,
	`billing_phone` text,
	`hosted_invoice_url` text,
	`invoice_pdf` text,
	`payment_intent_id` text,
	`payment_method_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`due_date` text,
	`paid_at` text,
	`voided_at` text,
	`metadata` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_stripe_invoice_id_unique` ON `invoices` (`stripe_invoice_id`);--> statement-breakpoint
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
--> statement-breakpoint
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
CREATE INDEX `userIdIdx` ON `password_resets` (`user_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`is_from_admin` integer DEFAULT false NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messageUserIdIdx` ON `messages` (`user_id`);--> statement-breakpoint
CREATE INDEX `messageCreatedAtIdx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `messageIsReadIdx` ON `messages` (`is_read`);