"use strict";
/**
 * Enterprise-grade Stripe webhook handler for subscription management
 *
 * This implementation follows security best practices:
 * - Secure webhook signature verification
 * - Transaction-based database updates
 * - Comprehensive error handling and logging
 * - Proper type safety
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = require("stripe");
// Initialize Firestore database
const db = admin.firestore();
const logger = functions.logger;
// Type-safe Stripe instance initialization
const getStripeInstance = () => {
    try {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY || functions.config().stripe.secret_key;
        if (!stripeSecretKey) {
            throw new Error('Stripe secret key not configured');
        }
        return new stripe_1.Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            typescript: true,
        });
    }
    catch (error) {
        logger.error('Failed to initialize Stripe client', {
            error: error instanceof Error ? error.message : String(error)
        });
        throw new Error('Stripe initialization failed');
    }
};
/**
 * Core webhook handler for Stripe events
 * Firebase Functions v6.3.2 compatible implementation
 */
exports.stripeWebhook = functions.https.onRequest(async (request, response) => {
    try {
        // Validate request method
        if (request.method !== 'POST') {
            response.status(405).send('Method Not Allowed');
            return;
        }
        // Get Stripe webhook secret from environment
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe.webhook_secret;
        if (!webhookSecret) {
            logger.error('Stripe webhook secret not configured');
            response.status(500).send('Server configuration error');
            return;
        }
        // Get the signature from headers
        const signature = request.headers['stripe-signature'];
        if (!signature) {
            logger.error('Missing Stripe signature');
            response.status(400).send('Missing signature');
            return;
        }
        // Get Stripe instance
        const stripe = getStripeInstance();
        // Handle raw body for signature verification
        let event;
        try {
            // Type-safe handling of request body
            // Use the rawBody property that we've properly typed in types.d.ts
            const rawBody = request.rawBody ||
                (request.body && typeof request.body === 'string' ? request.body : JSON.stringify(request.body));
            event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (err) {
            // Enterprise-grade error handling
            logger.error('Webhook signature verification failed', {
                error: err instanceof Error ? err.message : String(err),
                headers: JSON.stringify(request.headers)
            });
            response.status(400).send('Webhook signature verification failed');
            return;
        }
        // Audit logging for security traceability
        logger.info(`Processing Stripe webhook event: ${event.type}`, {
            eventId: event.id,
            eventType: event.type,
            timestamp: new Date().toISOString()
        });
        // Process different event types with explicit type checking
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCancellation(event.data.object);
                break;
            case 'invoice.paid':
                await handleSuccessfulPayment(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handleFailedPayment(event.data.object);
                break;
            default:
                // Log unhandled events but don't treat them as errors
                logger.info(`Unhandled Stripe event type: ${event.type}`, {
                    eventId: event.id
                });
        }
        // Send success response
        response.status(200).send({ received: true });
    }
    catch (error) {
        // Enterprise-grade error handling
        logger.error('Unhandled error in Stripe webhook', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        // Avoid leaking error details in production
        response.status(500).send('Internal server error');
    }
});
/**
 * Handle subscription created or updated events
 * Uses transactions for data integrity
 */
async function handleSubscriptionUpdate(subscription) {
    var _a, _b;
    try {
        // Extract user ID from metadata
        const userId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            logger.error('Missing userId in subscription metadata', {
                subscriptionId: subscription.id
            });
            return;
        }
        // Format subscription data for Firestore
        const subscriptionData = {
            status: subscription.status,
            currentPeriodStart: admin.firestore.Timestamp.fromMillis(subscription.current_period_start * 1000),
            currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            createdAt: admin.firestore.Timestamp.fromMillis(subscription.created * 1000),
            stripeSubscriptionId: subscription.id,
            stripePlanId: (_b = subscription.items.data[0]) === null || _b === void 0 ? void 0 : _b.plan.id,
            stripeCustomerId: subscription.customer,
            updatedAt: admin.firestore.Timestamp.now(),
            metadata: {
                updatedVia: 'stripe-webhook',
                eventTimestamp: admin.firestore.Timestamp.now()
            }
        };
        // Use transaction for atomicity and data integrity
        await db.runTransaction(async (transaction) => {
            var _a;
            // Get subscriber reference
            const subscriberRef = db.collection('subscribers').doc(userId);
            // Update subscription data
            transaction.set(subscriberRef, {
                subscription: subscriptionData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            // Add audit log
            const auditLogRef = db.collection('auditLogs').doc();
            transaction.set(auditLogRef, {
                userId,
                action: 'subscription_updated',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                details: {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    planId: (_a = subscription.items.data[0]) === null || _a === void 0 ? void 0 : _a.plan.id,
                    source: 'stripe-webhook'
                }
            });
        });
        logger.info('Successfully processed subscription update', {
            userId,
            subscriptionId: subscription.id,
            status: subscription.status
        });
    }
    catch (error) {
        logger.error('Error updating subscription from webhook', {
            error: error instanceof Error ? error.message : String(error),
            subscriptionId: subscription.id,
            customerId: subscription.customer
        });
        throw new Error(`Subscription update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Handle subscription cancellation events
 * Uses transactions for data integrity
 */
async function handleSubscriptionCancellation(subscription) {
    var _a;
    try {
        // Extract user ID from metadata
        const userId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            logger.error('Missing userId in subscription metadata', {
                subscriptionId: subscription.id
            });
            return;
        }
        // Use transaction for atomicity
        await db.runTransaction(async (transaction) => {
            var _a, _b;
            // Get subscriber reference
            const subscriberRef = db.collection('subscribers').doc(userId);
            // Update subscription status
            transaction.update(subscriberRef, {
                'subscription.status': subscription.status,
                'subscription.canceledAt': admin.firestore.Timestamp.fromMillis(subscription.canceled_at ? subscription.canceled_at * 1000 : Date.now()),
                'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
                'subscription.metadata.cancelReason': ((_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.cancelReason) || 'user_initiated',
                'subscription.metadata.updatedVia': 'stripe-webhook'
            });
            // Add audit log
            const auditLogRef = db.collection('auditLogs').doc();
            transaction.set(auditLogRef, {
                userId,
                action: 'subscription_canceled',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                details: {
                    subscriptionId: subscription.id,
                    cancelReason: ((_b = subscription.metadata) === null || _b === void 0 ? void 0 : _b.cancelReason) || 'user_initiated',
                    source: 'stripe-webhook'
                }
            });
        });
        logger.info('Successfully processed subscription cancellation', {
            userId,
            subscriptionId: subscription.id
        });
    }
    catch (error) {
        logger.error('Error processing subscription cancellation from webhook', {
            error: error instanceof Error ? error.message : String(error),
            subscriptionId: subscription.id,
            customerId: subscription.customer
        });
        throw new Error(`Subscription cancellation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Handle successful payment events
 */
async function handleSuccessfulPayment(invoice) {
    var _a;
    try {
        // Only process subscription invoices
        if (!invoice.subscription) {
            return;
        }
        // Get subscription details to find the user
        const stripe = getStripeInstance();
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            logger.error('Missing userId in subscription metadata', {
                subscriptionId: subscription.id,
                invoiceId: invoice.id
            });
            return;
        }
        // Record payment history
        await db.collection('paymentHistory').add({
            userId,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status,
            paidAt: admin.firestore.Timestamp.fromMillis(invoice.created * 1000),
            metadata: {
                stripeCustomerId: invoice.customer,
                billingReason: invoice.billing_reason,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'stripe-webhook'
            }
        });
        logger.info('Successfully recorded payment history', {
            userId,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription
        });
    }
    catch (error) {
        logger.error('Error processing successful payment from webhook', {
            error: error instanceof Error ? error.message : String(error),
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription
        });
        throw new Error(`Payment processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Handle failed payment events
 */
async function handleFailedPayment(invoice) {
    var _a, _b;
    try {
        // Only process subscription invoices
        if (!invoice.subscription) {
            return;
        }
        // Get subscription details to find the user
        const stripe = getStripeInstance();
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            logger.error('Missing userId in subscription metadata', {
                subscriptionId: subscription.id,
                invoiceId: invoice.id
            });
            return;
        }
        // Record payment failure
        await db.collection('paymentHistory').add({
            userId,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: invoice.status,
            failedAt: admin.firestore.Timestamp.fromMillis(invoice.created * 1000),
            nextPaymentAttempt: invoice.next_payment_attempt
                ? admin.firestore.Timestamp.fromMillis(invoice.next_payment_attempt * 1000)
                : null,
            metadata: {
                stripeCustomerId: invoice.customer,
                billingReason: invoice.billing_reason,
                // Safe access to payment error details
                failureReason: ((_b = invoice.last_payment_error) === null || _b === void 0 ? void 0 : _b.message) || 'Unknown failure reason',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'stripe-webhook'
            }
        });
        // Add notification for user about failed payment
        await db.collection('notifications').add({
            userId,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: 'Your recent subscription payment has failed. Please update your payment method.',
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                invoiceId: invoice.id,
                subscriptionId: invoice.subscription,
                nextAttemptAt: invoice.next_payment_attempt
                    ? admin.firestore.Timestamp.fromMillis(invoice.next_payment_attempt * 1000)
                    : null
            }
        });
        logger.info('Successfully recorded payment failure', {
            userId,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription
        });
    }
    catch (error) {
        logger.error('Error processing failed payment from webhook', {
            error: error instanceof Error ? error.message : String(error),
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription
        });
        throw new Error(`Failed payment handling error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=stripe.js.map