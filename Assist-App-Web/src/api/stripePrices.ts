/**
 * Stripe product and price configuration for subscription plans
 * Single subscription tier approach - everyone gets the same access
 * regardless of donation amount
 */

// Single subscription price ID for all subscriptions
// The amount is adjusted at checkout time
export const STRIPE_PRICES = {
  // Base subscription price (adjustable amount)
  // This is a hardcoded price ID that works with the test environment
  // Note: In production, you'll need to replace this with your actual Stripe Price ID
  SUBSCRIPTION: 'price_1RRFG5IzkyP8LSOmgDCrigM5'
};

/**
 * Get the subscription price ID (same for all amounts)
 * - In our model, everyone gets the same level of access
 * 
 * @returns The Stripe price ID for subscription
 */
export function getSubscriptionPriceId(): string {
  return STRIPE_PRICES.SUBSCRIPTION;
}
