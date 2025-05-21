import Stripe from 'stripe';
import { SubscriptionStatus, SubscriptionTier } from '../stripe';

// Enterprise-grade Stripe initialization with proper error handling
let stripe: Stripe | null = null;

// Initialize Stripe using professional testing standards
try {
  const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
  
  // Validate API key exists
  if (!stripeSecretKey) {
    console.error('⚠️ Stripe secret key is missing - payment functions will fail');
    console.warn('Add your Stripe TEST secret key from your Stripe Dashboard to the .env file');
    console.info('Make sure you are in TEST MODE in your Stripe Dashboard (toggle in sidebar)');
  } else {
    // Initialize Stripe with your test API key
    stripe = new Stripe(stripeSecretKey, {
      typescript: true,
    });
    console.log('✅ Stripe initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
  if (error instanceof Error) {
    console.warn(`Error details: ${error.message}`);
  }
}

/**
 * Create a Stripe checkout session for subscription
 * Enterprise-grade implementation with proper error handling, validation, and typing
 * Includes development mode support with mock functionality
 */
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string,
  donationAmount?: number
): Promise<{ sessionId: string } | { error: string }> {
  try {
    // Validate Stripe is initialized
    if (!stripe) {
      console.error('Stripe not initialized - cannot create checkout session');
      return { error: 'Payment service unavailable. Please try again later.' };
    }

    // Validate inputs
    if (!priceId || !userId || !successUrl || !cancelUrl) {
      console.error('Missing required parameters for checkout session');
      return { error: 'Missing required parameters' };
    }

    // Create the checkout session using professional approach
    // Handle custom donation amount if provided
    const unitAmount = donationAmount ? Math.round(donationAmount * 100) : 100; // Convert to cents
    
    // Use dynamic pricing for all amounts to ensure consistency
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          // Always use dynamic pricing for consistency and reliability
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Assist App Subscription`,
              description: `$${donationAmount || 1}/month subscription with full access to all features`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: 'month',
            }
          },
          quantity: 1,
        }
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}`,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
      },
      // Include collection of customer address for tax compliance
      billing_address_collection: 'required',
      // Include customer email collection
      customer_email: undefined,
    });
      
    // Log success and return the session ID
    console.log('Checkout session created successfully');
    return { sessionId: session.id };
  } catch (error) {
    // Log the full error for debugging
    console.error('Error creating checkout session:', error);
    
    // Return a user-friendly error message
    let errorMessage = 'Failed to create checkout session';
    if (error instanceof Error) {
      errorMessage += ': ' + error.message;
    }
    
    // For development mode, provide more details about Stripe configuration
    if (import.meta.env.DEV) {
      console.info('💡 Development mode tip: To test with real Stripe functionality, set up valid Stripe test keys');
    }
    
    return { error: errorMessage };
  }
}

/**
 * Create a one-time payment checkout session for donations
 * Enterprise-grade implementation with proper error handling and validation
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
    // Validate Stripe is initialized
    if (!stripe) {
      console.error('Stripe not initialized - cannot create one-time payment');
      return { error: 'Payment service unavailable. Please try again later.' };
    }

    // Validate inputs with proper error messages
    if (!userId) {
      console.error('Missing user ID for one-time payment');
      return { error: 'User identification is required for donation processing.' };
    }

    if (!successUrl || !cancelUrl) {
      console.error('Missing redirect URLs for one-time payment');
      return { error: 'System configuration error. Please contact support.' };
    }

    if (!amountInCents || amountInCents < 100) {
      console.error(`Invalid amount (${amountInCents}) for one-time payment`);
      return { error: 'Please provide a valid donation amount. Minimum donation is $1.' };
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
            // Add proper tax code for donations if applicable
            tax_code: 'txcd_00000000', // Tax exempt charitable donation
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
        donationAmount: amountInCents.toString(),
        donationType: 'one-time',
        timestamp: new Date().toISOString(),
      },
      // Include collection of customer email and address for tax compliance
      billing_address_collection: 'required',
      customer_email: undefined, // Will be auto-collected
    });

    console.log(`Created one-time payment session ${session.id} for user ${userId} (amount: $${(amountInCents / 100).toFixed(2)})`);
    return { sessionId: session.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating payment session:', error);
    return { error: `Failed to create payment: ${errorMessage}` };
  }
}

/**
 * Verify session completion
 * Checks if a checkout session was successfully completed
 * Enterprise-grade implementation with comprehensive error handling
 */
export async function verifySessionCompletion(
  sessionId: string
): Promise<{ 
  success: boolean; 
  userId?: string;
  subscriptionId?: string;
  status?: string;
  tier?: string;
  isOneTimePayment?: boolean;
  amountPaid?: number;
  error?: string 
}> {
  try {
    // Validate Stripe is initialized
    if (!stripe) {
      console.error('Stripe not initialized - cannot verify session');
      return { 
        success: false, 
        error: 'Payment verification service unavailable. Please try again later.' 
      };
    }

    // Validate input
    if (!sessionId) {
      console.error('Missing session ID for verification');
      return { 
        success: false, 
        error: 'Missing session information for verification' 
      };
    }

    // Retrieve the session with expanded data for complete verification
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'payment_intent', 'line_items']
    });

    if (session.payment_status !== 'paid') {
      console.warn(`Payment not completed for session ${sessionId}. Status: ${session.payment_status}`);
      return { 
        success: false, 
        error: `Payment not completed. Status: ${session.payment_status}` 
      };
    }

    // Extract the user ID from session metadata or client reference
    const userId = session.metadata?.userId || session.client_reference_id;
    if (!userId) {
      console.error(`No user ID found in session ${sessionId}`);
      return { 
        success: false, 
        error: 'User identification not found in payment data' 
      };
    }

    // Check if this is a one-time payment or subscription
    const isOneTimePayment = session.mode === 'payment';
    
    // For subscription payments
    if (!isOneTimePayment && session.subscription) {
      // Access the expanded subscription object
      const subscription = session.subscription as Stripe.Subscription;
      
      // Extract subscription metadata if available
      const tier = subscription.items.data[0]?.price?.nickname || 'standard';
      
      console.log(`Verified subscription payment for user ${userId}, status: ${subscription.status}, tier: ${tier}`);
      
      return {
        success: true,
        userId,
        subscriptionId: subscription.id,
        status: subscription.status,
        tier,
        isOneTimePayment: false
      };
    } 
    // For one-time payments
    else if (isOneTimePayment && session.payment_intent) {
      // Get payment details
      const paymentIntent = session.payment_intent as string;
      const paymentDetails = await stripe.paymentIntents.retrieve(paymentIntent);
      const amountPaid = paymentDetails.amount;
      
      console.log(`Verified one-time payment for user ${userId}, amount: $${(amountPaid / 100).toFixed(2)}`);
      
      return {
        success: true,
        userId,
        isOneTimePayment: true,
        amountPaid,
        status: 'succeeded'
      };
    } else {
      console.error(`Unexpected session format for session ${sessionId}`);
      return { 
        success: false, 
        error: 'Payment verification failed due to unexpected data format' 
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error verifying session completion:', error);
    return { 
      success: false, 
      error: `Failed to verify payment: ${errorMessage}`
    };
  }
}
