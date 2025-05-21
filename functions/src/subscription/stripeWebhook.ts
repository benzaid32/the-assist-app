import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as Stripe from 'stripe';
import { logger } from '../utils/logger';

// Initialize Stripe with proper error handling
let stripe: Stripe | null = null;
try {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    logger.error('Stripe secret key is missing in environment variables');
  } else {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Use the latest API version
      typescript: true,
    });
    logger.info('Stripe initialized successfully in webhook handler');
  }
} catch (error) {
  logger.error('Failed to initialize Stripe in webhook handler', { error });
}

/**
 * Type definitions for enterprise-grade webhook handling
 * Following strict typing standards per enterprise architecture requirements
 */
interface SubscriptionUpdateData {
  userId: string;
  status: string;
  tier: string;
  stripeSubscriptionId: string;
  stripePriceId?: string;
  stripeCustomerId?: string;
}

/**
 * Validate Stripe webhook signature for enterprise-grade security
 * @param signature The signature from the request header
 * @param payload The raw request body
 * @returns Whether the signature is valid
 */
function validateStripeSignature(signature: string | string[] | undefined, payload: Buffer): boolean {
  try {
    if (!stripe || !signature || typeof signature !== 'string') {
      logger.error('Missing Stripe instance or invalid signature format');
      return false;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('Stripe webhook secret is missing in environment variables');
      return false;
    }

    // Verify the event came from Stripe using webhook secret
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    // Signature is valid if constructEvent doesn't throw
    return true;
  } catch (error) {
    logger.error('Invalid Stripe webhook signature', { error });
    return false;
  }
}

/**
 * Update user subscription status in Firestore
 * Enterprise-grade implementation with atomic updates and error handling
 */
async function updateUserSubscription(data: SubscriptionUpdateData): Promise<boolean> {
  try {
    const { userId, status, tier, stripeSubscriptionId, stripePriceId, stripeCustomerId } = data;
    
    // Get Firestore database instance
    const db = admin.firestore();
    
    // Create atomic batch update for consistent data - enterprise transaction pattern
    const batch = db.batch();
    
    // Update subscription collection
    const subscriberRef = db.collection('subscribers').doc(userId);
    batch.set(subscriberRef, {
      subscription: {
        status,
        tier,
        stripeSubscriptionId,
        stripePriceId,
        stripeCustomerId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        startDate: admin.firestore.FieldValue.serverTimestamp(),
      }
    }, { merge: true });
    
    // Update user document with subscription status
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
      hasActiveSubscription: status === 'active',
      subscriptionStatus: status,
      subscriptionTier: tier,
      subscriptionId: stripeSubscriptionId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Commit the batch operation for atomic update
    await batch.commit();
    
    logger.info('Subscription data updated successfully via webhook', { 
      userId, 
      status, 
      subscriptionId: stripeSubscriptionId 
    });
    
    return true;
  } catch (error) {
    // Enterprise-grade error handling with proper logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to update subscription via webhook', { 
      userId: data.userId, 
      error: errorMessage 
    });
    
    return false;
  }
}

/**
 * Process a Stripe checkout.session.completed event
 * @param event The Stripe event object
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
  try {
    // Cast to session completed event
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Ensure we have a client reference ID (userId)
    const userId = session.client_reference_id;
    if (!userId) {
      logger.error('Missing client_reference_id (userId) in checkout session', { 
        sessionId: session.id 
      });
      return;
    }
    
    // For subscription payments
    if (session.mode === 'subscription' && session.subscription) {
      // Get subscription details
      if (!stripe) {
        logger.error('Stripe not initialized, cannot fetch subscription details');
        return;
      }
      
      // Get expanded subscription object to access full details
      const subscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription.id;
        
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price.product']
      });
      
      // Get tier from product name or metadata
      let tier = 'monthly'; // Default tier
      const priceItem = subscription.items.data[0];
      if (priceItem?.price?.product && typeof priceItem.price.product !== 'string') {
        const product = priceItem.price.product as Stripe.Product;
        // Try to get tier from product metadata or name
        tier = product.metadata.tier || 
               (product.name.toLowerCase().includes('annual') ? 'annual' : 'monthly');
      }
      
      // Update user's subscription in Firestore
      await updateUserSubscription({
        userId,
        status: subscription.status,
        tier,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price?.id,
        stripeCustomerId: subscription.customer as string
      });
      
      logger.info('Subscription created successfully via webhook', { 
        userId, 
        subscriptionId: subscription.id,
        status: subscription.status,
        tier
      });
    }
    // For one-time payments
    else if (session.mode === 'payment') {
      // Handle one-time payment logic if needed
      logger.info('One-time payment completed via webhook', { 
        userId, 
        sessionId: session.id 
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error handling checkout.session.completed event', { error: errorMessage });
  }
}

/**
 * Handle subscription status changes from Stripe
 * @param event The Stripe event object
 */
async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  try {
    // Cast to subscription event
    const subscription = event.data.object as Stripe.Subscription;
    
    // Find the user associated with this subscription
    const db = admin.firestore();
    const subscribersSnapshot = await db.collection('subscribers')
      .where('subscription.stripeSubscriptionId', '==', subscription.id)
      .limit(1)
      .get();
    
    if (subscribersSnapshot.empty) {
      logger.warn('No user found for subscription update event', { subscriptionId: subscription.id });
      return;
    }
    
    const userId = subscribersSnapshot.docs[0].id;
    
    // Get tier information
    let tier = 'monthly'; // Default tier
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      // Determine tier from price ID or other logic
      tier = priceId.includes('annual') ? 'annual' : 'monthly';
    }
    
    // Update user's subscription in Firestore
    await updateUserSubscription({
      userId,
      status: subscription.status,
      tier,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id,
      stripeCustomerId: subscription.customer as string
    });
    
    logger.info('Subscription updated successfully via webhook', { 
      userId, 
      subscriptionId: subscription.id,
      status: subscription.status
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error handling subscription updated event', { error: errorMessage });
  }
}

/**
 * Enterprise-grade Stripe webhook handler
 * Processes Stripe events and updates subscription status in Firestore
 * No authentication required as security is handled via webhook signatures
 */
export const stripeWebhookHandler = functions.https.onRequest(async (req, res) => {
  // Only allow POST method
  if (req.method !== 'POST') {
    logger.warn('Invalid method for Stripe webhook', { method: req.method });
    res.status(405).send('Method Not Allowed');
    return;
  }
  
  // Get the signature from the header
  const signature = req.headers['stripe-signature'];
  
  // Get raw body for signature verification
  const payload = req.rawBody;
  if (!payload) {
    logger.error('Missing raw body in Stripe webhook request');
    res.status(400).send('Missing payload');
    return;
  }
  
  // Validate signature for security
  if (!validateStripeSignature(signature, payload)) {
    logger.error('Invalid Stripe signature', { signature });
    res.status(401).send('Invalid signature');
    return;
  }
  
  try {
    // Parse the event
    if (!stripe) {
      logger.error('Stripe not initialized, cannot process webhook');
      res.status(500).send('Stripe initialization error');
      return;
    }
    
    const event = stripe.webhooks.constructEvent(
      payload,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event);
        break;
      
      default:
        logger.debug('Unhandled Stripe event type', { type: event.type });
    }
    
    // Return success
    res.status(200).send({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error processing Stripe webhook', { error: errorMessage });
    res.status(500).send('Webhook Error: ' + errorMessage);
  }
});
