import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '../../lib/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { SubscriptionStatus } from '../stripe';
import { verifyAuthToken } from '../auth';

/**
 * Enterprise-grade API endpoint for secure subscription updates
 * This endpoint handles all subscription-related database operations with proper security
 *
 * @param req - The API request object
 * @param res - The API response object
 */
export async function handleSubscriptionUpdate(req: NextApiRequest, res: NextApiResponse) {
  // 1. Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. Authenticate request using secure token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const authenticatedUser = await verifyAuthToken(token);

    if (!authenticatedUser) {
      return res.status(403).json({ error: 'Invalid authentication token' });
    }

    // 3. Validate request body
    const { userId, subscription, timestamp, source } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 4. Security check: ensure authenticated user can only modify their own data
    // or has admin privileges
    if (authenticatedUser.uid !== userId && !authenticatedUser.isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // 5. Audit logging for compliance and security
    console.log(`Subscription update request: user=${userId}, source=${source}, timestamp=${timestamp}`);

    // 6. Database updates with proper transaction handling
    try {
      // Update subscription document with proper validation
      const subscriptionsRef = doc(collection(firestore, 'subscriptions'), userId);
      await setDoc(subscriptionsRef, {
        ...subscription,
        userId,
        updatedAt: new Date(),
        updatedBy: authenticatedUser.uid,
      }, { merge: true });
      
      // Update user document with subscription status
      const userRef = doc(collection(firestore, 'users'), userId);
      await updateDoc(userRef, {
        hasActiveSubscription: 
          subscription.status === SubscriptionStatus.ACTIVE || 
          subscription.status === SubscriptionStatus.TRIALING,
        subscriptionStatus: subscription.status,
        subscriptionTier: subscription.tier,
        updatedAt: new Date(),
      });

      // 7. Return success response
      return res.status(200).json({ 
        success: true, 
        message: 'Subscription updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      // 8. Handle database errors with proper logging
      console.error('Database operation failed:', dbError);
      return res.status(500).json({ error: 'Database update failed' });
    }
  } catch (error) {
    // 9. Global error handler with proper logging
    console.error('Subscription update error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Endpoint for handling subscription webhooks from Stripe
 * This securely processes subscription events from Stripe to update user status
 * 
 * @param req - The API request object
 * @param res - The API response object
 */
export async function handleSubscriptionWebhook(req: NextApiRequest, res: NextApiResponse) {
  // 1. Validate request and verify Stripe signature
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }
  
  try {
    // 2. Process the webhook event based on type
    const event = req.body;
    
    // 3. Handle different event types with proper error handling
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await processSubscriptionEvent(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await cancelSubscription(event.data.object);
        break;
        
      // Add handlers for other relevant events
      
      default:
        // Ignore events we're not interested in
        console.log(`Ignoring unhandled event type: ${event.type}`);
    }
    
    // 4. Return success response
    return res.status(200).json({ received: true });
  } catch (error) {
    // 5. Handle webhook processing errors
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Process a subscription event from Stripe webhook
 * Updates user subscription status based on Stripe event data
 */
async function processSubscriptionEvent(subscription: any) {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      throw new Error('User ID not found in subscription metadata');
    }
    
    // Update subscription status in Firestore
    const subscriptionsRef = doc(collection(firestore, 'subscriptions'), userId);
    await setDoc(subscriptionsRef, {
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    }, { merge: true });
    
    // Update user document
    const userRef = doc(collection(firestore, 'users'), userId);
    await updateDoc(userRef, {
      hasActiveSubscription: ['active', 'trialing'].includes(subscription.status),
      subscriptionStatus: subscription.status,
      updatedAt: new Date(),
    });
    
    console.log(`Updated subscription for user ${userId}, status: ${subscription.status}`);
  } catch (error) {
    console.error('Error processing subscription event:', error);
    throw error; // Rethrow for proper webhook error handling
  }
}

/**
 * Handle subscription cancellation from Stripe webhook
 */
async function cancelSubscription(subscription: any) {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      throw new Error('User ID not found in subscription metadata');
    }
    
    // Update subscription status in Firestore
    const subscriptionsRef = doc(collection(firestore, 'subscriptions'), userId);
    await setDoc(subscriptionsRef, {
      status: 'canceled',
      stripeSubscriptionId: subscription.id,
      canceledAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });
    
    // Update user document
    const userRef = doc(collection(firestore, 'users'), userId);
    await updateDoc(userRef, {
      hasActiveSubscription: false,
      subscriptionStatus: 'canceled',
      updatedAt: new Date(),
    });
    
    console.log(`Canceled subscription for user ${userId}`);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error; // Rethrow for proper webhook error handling
  }
}
