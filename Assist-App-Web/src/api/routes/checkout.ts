import Stripe from 'stripe';
import { SubscriptionStatus, SubscriptionTier } from '../stripe';

// Initialize Stripe with secret key
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

/**
 * Create a Stripe checkout session for subscription
 * Enterprise-grade implementation with proper error handling, validation, and typing
 */
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string } | { error: string }> {
  try {
    // Validate inputs
    if (!priceId || !userId || !successUrl || !cancelUrl) {
      console.error('Missing required parameters for checkout session');
      return { error: 'Missing required parameters' };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}`,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { 
      error: `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Create a one-time payment checkout session for donations
 * Simpler MVP approach that allows users to donate any amount to get access
 * @param amountInCents The donation amount in cents
 * @param userId The user's ID for tracking
 * @param successUrl URL to redirect after successful payment
 * @param cancelUrl URL to redirect if payment is cancelled
 */
export async function createOneTimePayment(
  amountInCents: number,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string } | { error: string }> {
  try {
    // Validate inputs
    if (!amountInCents || amountInCents < 100 || !userId || !successUrl || !cancelUrl) {
      console.error('Missing or invalid parameters for one-time payment');
      return { error: 'Missing or invalid parameters. Minimum donation is $1.' };
    }

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Donation to The Assist App',
            description: 'Support our mission and get access to premium features',
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: 'payment', // One-time payment
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&donation=true`,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        donationAmount: amountInCents,
        donationType: 'one-time',
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating payment session:', error);
    return { 
      error: `Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Verify session completion
 * Checks if a checkout session was successfully completed
 */
export async function verifySessionCompletion(
  sessionId: string
): Promise<{ 
  success: boolean; 
  userId?: string;
  subscriptionId?: string;
  status?: string;
  error?: string 
}> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      return { 
        success: false, 
        error: `Payment not completed. Status: ${session.payment_status}` 
      };
    }

    const userId = session.metadata?.userId || session.client_reference_id;
    if (!userId) {
      return { 
        success: false, 
        error: 'User ID not found in session' 
      };
    }

    // Access the expanded subscription object
    const subscription = session.subscription as Stripe.Subscription;
    
    return {
      success: true,
      userId,
      subscriptionId: subscription.id,
      status: subscription.status
    };
  } catch (error) {
    console.error('Error verifying session completion:', error);
    return { 
      success: false, 
      error: `Failed to verify session: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
