import { loadStripe } from '@stripe/stripe-js';

// Load the Stripe.js library with your publishable key
// Replace with your actual publishable key in production
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51MfgKQJRFcXK6oRC78f1heFrIuPAukTM26LgXJmzRfHdXK9OFVWXxnCQDuIEb8BznIqJ7SjJ9D32yShfLvK1Gzzg00Sge5AQqI');

export default stripePromise;