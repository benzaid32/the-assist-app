import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { SubscriptionStatus, SubscriptionTier } from './types';
import { logger } from '../utils/logger';

// We'll initialize Stripe in the function to avoid issues with cold starts
// and configuration not being available during builds
let stripe: any;

// Helper function to get Stripe instance
function getStripeInstance() {
  if (!stripe) {
    // Dynamically import Stripe to avoid issues during build time
    // This is a common pattern for Firebase Functions
    const Stripe = require('stripe');
    stripe = new Stripe(functions.config().stripe.secret_key, {
      apiVersion: '2022-11-15',
      maxNetworkRetries: 3,
    });
  }
  return stripe;
}

/**
 * Validates subscription data against Stripe records
 * Ensures that subscription data in Firestore matches Stripe's records
 */
export async function validateSubscriptionWithStripe(
  userId: string,
  stripeSubscriptionId: string
): Promise<{
  isValid: boolean;
  stripeStatus?: string;
  firestoreStatus?: SubscriptionStatus;
  errors?: string[];
}> {
  const errors: string[] = [];
  
  try {
    // Get subscription data from Firestore
    const db = admin.firestore();
    const subscriberDoc = await db.collection('subscribers').doc(userId).get();
    
    if (!subscriberDoc.exists) {
      return { 
        isValid: false, 
        errors: ['Subscriber document does not exist in Firestore'] 
      };
    }
    
    const subscriberData = subscriberDoc.data();
    if (!subscriberData?.subscription) {
      return { 
        isValid: false, 
        errors: ['Subscription field does not exist in subscriber document'] 
      };
    }
    
    const firestoreSubscription = subscriberData.subscription;
    const firestoreStatus = firestoreSubscription.status;
    
    // Get subscription data from Stripe
    const stripeClient = getStripeInstance();
    const stripeSubscription = await stripeClient.subscriptions.retrieve(stripeSubscriptionId);
    const stripeStatus = stripeSubscription.status;
    
    // Map Stripe subscription status to our app's status
    const expectedAppStatus = mapStripeStatusToAppStatus(stripeStatus);
    
    // Validate status consistency
    if (firestoreStatus !== expectedAppStatus) {
      errors.push(`Status mismatch: Firestore shows ${firestoreStatus}, Stripe shows ${stripeStatus} (expected app status: ${expectedAppStatus})`);
    }
    
    // Validate subscription IDs match
    if (firestoreSubscription.stripeSubscriptionId !== stripeSubscriptionId) {
      errors.push('Stripe subscription ID mismatch between Firestore and provided ID');
    }
    
    // Validate customer ID
    if (firestoreSubscription.stripeCustomerId !== stripeSubscription.customer) {
      errors.push('Stripe customer ID mismatch between Firestore and Stripe');
    }
    
    return {
      isValid: errors.length === 0,
      stripeStatus,
      firestoreStatus,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    logger.error('Error validating subscription data', { error, userId, stripeSubscriptionId });
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred during validation']
    };
  }
}

/**
 * Maps Stripe subscription status to our application's status enum
 */
export function mapStripeStatusToAppStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'trialing':
      return SubscriptionStatus.TRIAL;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
    case 'unpaid':
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.INACTIVE;
  }
}

/**
 * Validates changes to subscription data
 * Returns true if changes are valid, false otherwise
 */
export function validateSubscriptionChanges(
  oldData: any, 
  newData: any
): { 
  isValid: boolean; 
  errors?: string[];
} {
  const errors: string[] = [];
  
  // Check if essential fields exist
  if (!newData.status) {
    errors.push('Missing required field: status');
  }
  
  // Validate status enum
  if (newData.status && !Object.values(SubscriptionStatus).includes(newData.status)) {
    errors.push(`Invalid subscription status: ${newData.status}`);
  }
  
  // Validate tier enum if present
  if (newData.tier && !Object.values(SubscriptionTier).includes(newData.tier)) {
    errors.push(`Invalid subscription tier: ${newData.tier}`);
  }
  
  // Check if critical fields changed that shouldn't be changed directly
  if (oldData) {
    // Check if customer ID changed (this should only happen through official flows)
    if (oldData.stripeCustomerId && 
        newData.stripeCustomerId && 
        oldData.stripeCustomerId !== newData.stripeCustomerId) {
      errors.push('Stripe customer ID cannot be changed directly');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}
