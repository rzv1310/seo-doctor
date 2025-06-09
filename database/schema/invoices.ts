import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { subscriptions } from './subscriptions';



export const invoices = sqliteTable('invoices', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    subscriptionId: text('subscription_id').references(() => subscriptions.id),
    stripeInvoiceId: text('stripe_invoice_id').unique().notNull(),
    stripeCustomerId: text('stripe_customer_id').notNull(),
    
    // Invoice details
    number: text('number'),
    status: text('status').notNull(), // draft, open, paid, void, uncollectible
    currency: text('currency').notNull().default('RON'),
    amountTotal: integer('amount_total').notNull(), // Total in smallest currency unit
    amountPaid: integer('amount_paid').notNull().default(0),
    amountRemaining: integer('amount_remaining').notNull().default(0),
    
    // Service details
    serviceName: text('service_name'),
    serviceId: text('service_id'),
    
    // Billing details snapshot at time of invoice
    billingName: text('billing_name'),
    billingCompany: text('billing_company'),
    billingVat: text('billing_vat'),
    billingAddress: text('billing_address'),
    billingPhone: text('billing_phone'),
    
    // URLs
    hostedInvoiceUrl: text('hosted_invoice_url'),
    invoicePdf: text('invoice_pdf'),
    
    // Payment details
    paymentIntentId: text('payment_intent_id'),
    paymentMethodId: text('payment_method_id'),
    
    // Timestamps
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    dueDate: text('due_date'),
    paidAt: text('paid_at'),
    voidedAt: text('voided_at'),
    
    // Metadata
    metadata: text('metadata'), // JSON string
});