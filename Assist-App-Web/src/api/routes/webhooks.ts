import Stripe from 'stripe';
import { SubscriptionStatus, SubscriptionTier, StripeService } from '../stripe';

// Initialize Stripe with secret key
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

// Webhook signing secret for verifying Stripe events
const webhookSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '';

/**
 * Handle Stripe webhook events
 * Enterprise-grade implementation with security verification and comprehensive event handling
 */
export async function handleWebhookEvent(
  signature: string, 
  payload: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify webhook signature to prevent fraudulent requests
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err);
      return { success: false, error: 'Webhook signature verification failed' };
    }

    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return { 
      success: false, 
      error: `Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  
  // Get the client_reference_id (user ID) from the session
  const userId = session.client_reference_id || session.metadata?.userId;
  
  if (!userId) {
    console.error('No userId found in completed checkout session');
    return;
  }
  
  // Fetch the subscription details
  if (session.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id;
      const productId = subscription.items.data[0]?.price.product as string;
      
      // Get the product details to determine the tier
      const product = await stripe.products.retrieve(productId);
      const tierName = product.name.toLowerCase();
      
      // Determine subscription tier based on product name
      let tier = SubscriptionTier.MONTHLY;
      if (tierName.includes('annual')) {
        tier = SubscriptionTier.ANNUAL;
      } else if (tierName.includes('lifetime')) {
        tier = SubscriptionTier.LIFETIME;
      }
      
      // Update subscription status in Firestore
      await StripeService.updateSubscriptionStatus(userId, {
        status: subscription.status as SubscriptionStatus,
        tier,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        startDate: new Date(subscription.start_date * 1000),
        currentPeriodEnd: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000) 
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      });
      
      console.log(`✅ Successfully processed subscription for user ${userId}`);
    } catch (error) {
      console.error('Error processing checkout session completion:', error);
    }
  }
}

/**
 * Handle customer.subscription.created or customer.subscription.updated events
 */
async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  
  try {
    // Get customer to find the userId
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error('Customer has been deleted');
      return;
    }
    
    const userId = customer.metadata.userId;
    if (!userId) {
      console.error('No userId found in customer metadata');
      return;
    }
    
    const priceId = subscription.items.data[0]?.price.id;
    const productId = subscription.items.data[0]?.price.product as string;
    
    // Get product details to determine tier
    const product = await stripe.products.retrieve(productId);
    const tierName = product.name.toLowerCase();
    
    // Determine subscription tier based on product name
    let tier = SubscriptionTier.MONTHLY;
    if (tierName.includes('annual')) {
      tier = SubscriptionTier.ANNUAL;
    } else if (tierName.includes('lifetime')) {
      tier = SubscriptionTier.LIFETIME;
    }
    
    // Update subscription status in Firestore
    await StripeService.updateSubscriptionStatus(userId, {
      status: subscription.status as SubscriptionStatus,
      tier,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      startDate: subscription.start_date ? new Date(subscription.start_date * 1000) : new Date(),
      currentPeriodEnd: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000) 
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    });
    
    console.log(`✅ Successfully updated subscription status for user ${userId} to ${subscription.status}`);
  } catch (error) {
    console.error('Error processing subscription update:', error);
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  
  try {
    // Get customer to find the userId
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error('Customer has been deleted');
      return;
    }
    
    const userId = customer.metadata.userId;
    if (!userId) {
      console.error('No userId found in customer metadata');
      return;
    }
    
    // Update subscription status in Firestore
    await StripeService.updateSubscriptionStatus(userId, {
      status: SubscriptionStatus.CANCELED,
      tier: SubscriptionTier.MONTHLY, // Default tier
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    });
    
    console.log(`✅ Successfully marked subscription as canceled for user ${userId}`);
  } catch (error) {
    console.error('Error processing subscription deletion:', error);
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    console.log('Invoice is not associated with a subscription');
    return;
  }
  
  try {
    // Get customer to find the userId
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error('Customer has been deleted');
      return;
    }
    
    const userId = customer.metadata.userId;
    if (!userId) {
      console.error('No userId found in customer metadata');
      return;
    }
    
    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Mark as active if it wasn't already
    if (subscription.status !== 'active') {
      console.log(`Updating subscription status to active for user ${userId}`);
      
      const priceId = subscription.items.data[0]?.price.id;
      const productId = subscription.items.data[0]?.price.product as string;
      
      // Get product details to determine tier
      const product = await stripe.products.retrieve(productId);
      const tierName = product.name.toLowerCase();
      
      // Determine subscription tier based on product name
      let tier = SubscriptionTier.MONTHLY;
      if (tierName.includes('annual')) {
        tier = SubscriptionTier.ANNUAL;
      } else if (tierName.includes('lifetime')) {
        tier = SubscriptionTier.LIFETIME;
      }
      
      // Update subscription status in Firestore
      await StripeService.updateSubscriptionStatus(userId, {
        status: SubscriptionStatus.ACTIVE,
        tier,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        startDate: subscription.start_date ? new Date(subscription.start_date * 1000) : new Date(),
        currentPeriodEnd: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000) 
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      });
      
      console.log(`✅ Successfully marked subscription as active for user ${userId}`);
    }
  } catch (error) {
    console.error('Error processing invoice payment succeeded:', error);
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    console.log('Invoice is not associated with a subscription');
    return;
  }
  
  try {
    // Get customer to find the userId
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error('Customer has been deleted');
      return;
    }
    
    const userId = customer.metadata.userId;
    if (!userId) {
      console.error('No userId found in customer metadata');
      return;
    }
    
    // Get the subscription details to check its current status
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Only update if the status has changed
    if (subscription.status === SubscriptionStatus.PAST_DUE || 
        subscription.status === SubscriptionStatus.UNPAID) {
      // Update subscription status in Firestore
      await StripeService.updateSubscriptionStatus(userId, {
        status: subscription.status as SubscriptionStatus,
        tier: SubscriptionTier.MONTHLY, // Default tier
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        updatedAt: new Date(),
      });
      
      console.log(`⚠️ Marked subscription as ${subscription.status} for user ${userId}`);
    }
  } catch (error) {
    console.error('Error processing invoice payment failed:', error);
  }
}
