/**
 * Enterprise-grade Stripe subscription system
 * 
 * This is a comprehensive implementation that follows enterprise security standards:
 * - Proper webhook signature verification
 * - Secure callable functions with authentication
 * - Transaction-based database operations
 * - Comprehensive error handling and logging
 * - Audit trail for all subscription changes
 */

// Initialize Firebase Admin SDK
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
initializeApp();

// Export webhook handler for Stripe events
export { stripeWebhook } from './webhooks/stripe';

// Export callable function for client-side operations
export { updateSubscriptionStatus } from './callables/subscription';
